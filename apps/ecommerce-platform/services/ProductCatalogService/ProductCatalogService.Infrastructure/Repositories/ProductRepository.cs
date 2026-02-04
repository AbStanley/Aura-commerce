using Microsoft.EntityFrameworkCore;
using ProductCatalogService.Domain.Entities;
using ProductCatalogService.Domain.Interfaces;
using ProductCatalogService.Infrastructure.Persistence;

namespace ProductCatalogService.Infrastructure.Repositories;

public sealed class ProductRepository(ProductCatalogDbContext context) : IProductRepository
{
    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await context.Products.FindAsync([id], cancellationToken);

    public async Task<Product?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default)
        => await context.Products.FirstOrDefaultAsync(p => p.Sku == sku, cancellationToken);

    public async Task<IEnumerable<Product>> GetByCategoryAsync(
        Guid categoryId,
        CancellationToken cancellationToken = default)
        => await context.Products
            .Where(p => p.CategoryId == categoryId && p.IsActive)
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.Products
            .Where(p => p.IsActive)
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<Product>> SearchAsync(
        string searchTerm,
        CancellationToken cancellationToken = default)
        => await context.Products
            .Where(p => p.IsActive && (
                p.Name.ToLower().Contains(searchTerm.ToLower()) ||
                p.Description.ToLower().Contains(searchTerm.ToLower()) ||
                p.Sku.ToLower().Contains(searchTerm.ToLower())))
            .ToListAsync(cancellationToken);

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await context.Products.AddAsync(product, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        context.Products.Update(product);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await context.Products
            .Where(p => p.Id == id)
            .ExecuteDeleteAsync(cancellationToken);
    }
}
