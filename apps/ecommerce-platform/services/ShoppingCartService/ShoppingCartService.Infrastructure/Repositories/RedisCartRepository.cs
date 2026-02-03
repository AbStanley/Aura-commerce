using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using ShoppingCartService.Domain.Entities;
using ShoppingCartService.Domain.Interfaces;

namespace ShoppingCartService.Infrastructure.Repositories;

public sealed class RedisCartRepository(IDistributedCache cache) : ICartRepository
{
    private static string GetCacheKey(Guid userId) => $"cart:{userId}";

    private static readonly DistributedCacheEntryOptions CacheOptions = new()
    {
        SlidingExpiration = TimeSpan.FromDays(7)
    };

    public async Task<ShoppingCart?> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var json = await cache.GetStringAsync(GetCacheKey(userId), cancellationToken);

        return string.IsNullOrEmpty(json)
            ? null
            : JsonSerializer.Deserialize<ShoppingCart>(json);
    }

    public async Task SaveAsync(ShoppingCart cart, CancellationToken cancellationToken = default)
    {
        var json = JsonSerializer.Serialize(cart);
        await cache.SetStringAsync(GetCacheKey(cart.UserId), json, CacheOptions, cancellationToken);
    }

    public async Task DeleteAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await cache.RemoveAsync(GetCacheKey(userId), cancellationToken);
    }
}
