using Microsoft.EntityFrameworkCore;
using ProductCatalogService.Domain.Entities;
using ProductCatalogService.Domain.Interfaces;
using ProductCatalogService.Infrastructure.Persistence;

namespace ProductCatalogService.Infrastructure.Repositories;

public sealed class InventoryRepository(ProductCatalogDbContext context) : IInventoryRepository
{
    public async Task<Inventory?> GetByProductIdAsync(
        Guid productId,
        CancellationToken cancellationToken = default)
        => await context.Inventories
            .FirstOrDefaultAsync(i => i.ProductId == productId, cancellationToken);

    public async Task AddAsync(Inventory inventory, CancellationToken cancellationToken = default)
    {
        await context.Inventories.AddAsync(inventory, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Inventory inventory, CancellationToken cancellationToken = default)
    {
        context.Inventories.Update(inventory);
        await context.SaveChangesAsync(cancellationToken);
    }
}
