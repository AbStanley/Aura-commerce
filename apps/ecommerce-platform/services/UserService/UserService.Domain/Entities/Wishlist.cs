using Shared.Domain.Entities;

namespace UserService.Domain.Entities;

public sealed class Wishlist : BaseEntity
{
    public required Guid UserId { get; init; }
    public required Guid ProductId { get; init; }
    public DateTime AddedAt { get; init; } = DateTime.UtcNow;
}
