namespace Shared.Contracts.Events;

/// <summary>
/// Event published when an order is confirmed
/// </summary>
public sealed record OrderConfirmedEvent
{
    public required Guid OrderId { get; init; }
    public required Guid UserId { get; init; }
    public required DateTime ConfirmedAt { get; init; }
}
