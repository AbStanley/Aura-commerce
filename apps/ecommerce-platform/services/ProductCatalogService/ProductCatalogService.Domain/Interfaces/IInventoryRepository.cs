using ProductCatalogService.Domain.Entities;

namespace ProductCatalogService.Domain.Interfaces;

/// <summary>
/// Repository interface for Inventory operations
/// </summary>
public interface IInventoryRepository
{
    Task<Inventory?> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken = default);
    Task AddAsync(Inventory inventory, CancellationToken cancellationToken = default);
    Task UpdateAsync(Inventory inventory, CancellationToken cancellationToken = default);
}
