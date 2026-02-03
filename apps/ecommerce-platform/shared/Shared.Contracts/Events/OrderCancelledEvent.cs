namespace Shared.Contracts.Events;

/// <summary>
/// Event published when an order is cancelled
/// </summary>
public sealed record OrderCancelledEvent
{
    public required Guid OrderId { get; init; }
    public required Guid UserId { get; init; }
    public required string Reason { get; init; }
    public required DateTime CancelledAt { get; init; }
}
