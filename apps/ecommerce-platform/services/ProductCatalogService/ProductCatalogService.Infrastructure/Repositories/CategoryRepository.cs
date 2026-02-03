using Microsoft.EntityFrameworkCore;
using ProductCatalogService.Domain.Entities;
using ProductCatalogService.Domain.Interfaces;
using ProductCatalogService.Infrastructure.Persistence;

namespace ProductCatalogService.Infrastructure.Repositories;

public sealed class CategoryRepository(ProductCatalogDbContext context) : ICategoryRepository
{
    public async Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await context.Categories.FindAsync([id], cancellationToken);

    public async Task<IEnumerable<Category>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.Categories
            .Where(c => c.IsActive)
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<Category>> GetChildrenAsync(
        Guid parentId,
        CancellationToken cancellationToken = default)
        => await context.Categories
            .Where(c => c.ParentCategoryId == parentId && c.IsActive)
            .ToListAsync(cancellationToken);

    public async Task AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        await context.Categories.AddAsync(category, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Category category, CancellationToken cancellationToken = default)
    {
        context.Categories.Update(category);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await context.Categories
            .Where(c => c.Id == id)
            .ExecuteDeleteAsync(cancellationToken);
    }
}
