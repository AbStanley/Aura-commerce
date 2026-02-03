using Microsoft.EntityFrameworkCore;
using Shared.Infrastructure.Persistence;
using ProductCatalogService.Domain.Entities;

namespace ProductCatalogService.Infrastructure.Persistence;

/// <summary>
/// Product Catalog Service database context
/// </summary>
public sealed class ProductCatalogDbContext(DbContextOptions<ProductCatalogDbContext> options) 
    : BaseDbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Inventory> Inventories => Set<Inventory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProductCatalogDbContext).Assembly);
    }
}
