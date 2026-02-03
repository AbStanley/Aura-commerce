using ProductCatalogService.Domain.Entities;

namespace ProductCatalogService.Domain.Interfaces;

/// <summary>
/// Repository interface for Category operations
/// </summary>
public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Category>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Category>> GetChildrenAsync(Guid parentId, CancellationToken cancellationToken = default);
    Task AddAsync(Category category, CancellationToken cancellationToken = default);
    Task UpdateAsync(Category category, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
