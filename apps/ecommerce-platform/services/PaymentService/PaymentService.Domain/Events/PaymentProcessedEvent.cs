namespace PaymentService.Domain.Events;

public sealed record PaymentProcessedEvent(
    Guid PaymentId,
    Guid OrderId,
    bool IsSuccess,
    string? TransactionId,
    string? FailureMessage)
{
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}
