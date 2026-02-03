namespace UserService.Domain.Events;

/// <summary>
/// Domain event fired when a user registers
/// </summary>
public sealed record UserRegisteredEvent(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    DateTime RegisteredAt);
