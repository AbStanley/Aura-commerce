namespace UserService.Domain.Events;

/// <summary>
/// Domain event fired when a user's profile is updated
/// </summary>
public sealed record UserProfileUpdatedEvent(
    Guid UserId,
    string Email,
    DateTime UpdatedAt);
