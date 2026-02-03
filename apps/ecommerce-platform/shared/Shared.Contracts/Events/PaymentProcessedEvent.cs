namespace Shared.Contracts.Events;

/// <summary>
/// Event published when payment is successfully processed
/// </summary>
public sealed record PaymentProcessedEvent
{
    public required Guid PaymentId { get; init; }
    public required Guid OrderId { get; init; }
    public required decimal Amount { get; init; }
    public required string TransactionId { get; init; }
    public required DateTime ProcessedAt { get; init; }
}
