using Shared.Infrastructure.Entities;

namespace UserService.Domain.Entities;

/// <summary>
/// Refresh token for JWT authentication
/// </summary>
public sealed class RefreshToken : BaseEntity
{
    public required string Token { get; init; }
    public required Guid UserId { get; init; }
    public required DateTime ExpiresAt { get; init; }
    public bool IsRevoked { get; set; }
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;

    public static RefreshToken Create(Guid userId, string token, int validDays = 7)
        => new()
        {
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(validDays)
        };
}
