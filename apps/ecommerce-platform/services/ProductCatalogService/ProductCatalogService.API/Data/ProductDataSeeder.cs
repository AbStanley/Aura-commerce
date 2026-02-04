using ProductCatalogService.Domain.Entities;
using ProductCatalogService.Infrastructure.Persistence;
using Shared.Infrastructure.Logging;
using Serilog;

namespace ProductCatalogService.API.Data;

public static class ProductDataSeeder
{
    public static async Task SeedAsync(ProductCatalogDbContext context)
    {
        if (context.Products.Any())
        {
            Log.Information("Data already seeded.");
            return;
        }

        Log.Information("Seeding initial data...");

        var electronics = Category.Create("Electronics", "Gadgets and devices");
        var clothing = Category.Create("Clothing", "Apparel for men and women");
        var books = Category.Create("Books", "Fiction and non-fiction");
        var home = Category.Create("Home & Kitchen", "Essentials for your daily life");

        context.Categories.AddRange(electronics, clothing, books, home);
        await context.SaveChangesAsync();

        var products = new List<Product>
        {
            // Electronics
            Product.Create("Smartphone X", "Latest model with AI camera", "ELEC-001", 999.99m, electronics.Id),
            Product.Create("Laptop Pro", "High performance for devs", "ELEC-002", 1999.99m, electronics.Id),
            Product.Create("Wireless Earbuds", "Noise cancelling audio", "ELEC-003", 149.99m, electronics.Id),
            Product.Create("Smart Watch", "Fitness tracking and notifications", "ELEC-004", 299.99m, electronics.Id),
            Product.Create("4K Monitor", "32-inch ultra HD display", "ELEC-005", 499.99m, electronics.Id),
            Product.Create("Mechanical Keyboard", "Clicky switches for typing", "ELEC-006", 129.99m, electronics.Id),
            Product.Create("Gaming Mouse", "Precision sensor", "ELEC-007", 79.99m, electronics.Id),
            Product.Create("Tablet Air", "Lightweight and powerful", "ELEC-008", 599.99m, electronics.Id),

            // Clothing
            Product.Create("Cotton T-Shirt", "Premium cotton basic tee", "CLOTH-001", 29.99m, clothing.Id),
            Product.Create("Slim Jeans", "Comfortable denim", "CLOTH-002", 59.99m, clothing.Id),
            Product.Create("Running Shoes", "Breathable mesh sneakers", "CLOTH-003", 89.99m, clothing.Id),
            Product.Create("Leather Jacket", "Classic biker style", "CLOTH-004", 199.99m, clothing.Id),
            Product.Create("Hoodie", "Warm fleece pullover", "CLOTH-005", 49.99m, clothing.Id),

            // Books
            Product.Create("The Pragmatic Programmer", "Classic dev book", "BOOK-001", 39.99m, books.Id),
            Product.Create("Clean Code", "Robert C. Martin", "BOOK-002", 44.99m, books.Id),
            Product.Create("Design Patterns", "GoF Standard", "BOOK-003", 54.99m, books.Id),
            Product.Create("Domain-Driven Design", "Blue book by Evans", "BOOK-004", 59.99m, books.Id),

            // Home
            Product.Create("Coffee Maker", "Automatic drip control", "HOME-001", 79.99m, home.Id),
            Product.Create("Blender", "High speed smoothie maker", "HOME-002", 129.99m, home.Id),
            Product.Create("Air Fryer", "Healthy cooking with less oil", "HOME-003", 89.99m, home.Id),
            Product.Create("Robot Vacuum", "Smart cleaning helper", "HOME-004", 249.99m, home.Id),
        };

        context.Products.AddRange(products);
        await context.SaveChangesAsync();

        // Seed Inventory
        Log.Information("Seeding inventory...");
        var inventories = products.Select(p => Inventory.Create(p.Id, new Random().Next(20, 100))).ToList();
        
        // Ensure specific items mentioned by user have plenty of stock
        var airFryer = products.FirstOrDefault(p => p.Name.Contains("Air Fryer"));
        if(airFryer != null)
        {
             var inv = inventories.First(i => i.ProductId == airFryer.Id);
             inv.QuantityAvailable = 50; 
        }

        context.Inventories.AddRange(inventories);
        await context.SaveChangesAsync();
        
        Log.Information("Data seeding completed.");
    }
}
