namespace Shared.Contracts.Events;

/// <summary>
/// Event published when an order is shipped
/// </summary>
public sealed record OrderShippedEvent
{
    public required Guid OrderId { get; init; }
    public required Guid UserId { get; init; }
    public required string TrackingNumber { get; init; }
    public required DateTime ShippedAt { get; init; }
}
