using Shared.Infrastructure.Entities;
using PaymentService.Domain.Enums;

namespace PaymentService.Domain.Entities;

public sealed class Payment : BaseEntity
{
    public required Guid OrderId { get; init; }
    public required Guid UserId { get; init; }
    public required decimal Amount { get; init; }
    public required string Currency { get; init; }
    public required string PaymentMethodId { get; init; }
    public string? TransactionId { get; private set; } // Provider's ID (e.g., Stripe PaymentIntentId)
    public string? FailureMessage { get; private set; }
    public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;
    public DateTime? ProcessedAt { get; private set; }

    public static Payment Create(Guid orderId, Guid userId, decimal amount, string currency, string paymentMethodId)
        => new()
        {
            OrderId = orderId,
            UserId = userId,
            Amount = amount,
            Currency = currency, // e.g., "usd"
            PaymentMethodId = paymentMethodId
        };

    public void MarkCompleted(string transactionId)
    {
        if (Status != PaymentStatus.Pending)
            throw new InvalidOperationException($"Cannot complete payment in {Status} status");

        Status = PaymentStatus.Completed;
        TransactionId = transactionId;
        ProcessedAt = DateTime.UtcNow;
    }

    public void MarkFailed(string failureMessage)
    {
        Status = PaymentStatus.Failed;
        FailureMessage = failureMessage;
        ProcessedAt = DateTime.UtcNow;
    }

    public void MarkRefunded()
    {
        if (Status != PaymentStatus.Completed)
            throw new InvalidOperationException($"Cannot refund payment in {Status} status");

        Status = PaymentStatus.Refunded;
    }
}
