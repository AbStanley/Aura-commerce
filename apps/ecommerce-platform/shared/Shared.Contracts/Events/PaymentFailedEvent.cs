namespace Shared.Contracts.Events;

/// <summary>
/// Event published when payment processing fails
/// </summary>
public sealed record PaymentFailedEvent
{
    public required Guid PaymentId { get; init; }
    public required Guid OrderId { get; init; }
    public required string Reason { get; init; }
    public required DateTime FailedAt { get; init; }
}
