using ShoppingCartService.Domain.Entities;

namespace ShoppingCartService.Domain.Interfaces;

/// <summary>
/// Repository interface for shopping cart (Redis-based)
/// </summary>
public interface ICartRepository
{
    Task<ShoppingCart?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task SaveAsync(ShoppingCart cart, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid userId, CancellationToken cancellationToken = default);
}
