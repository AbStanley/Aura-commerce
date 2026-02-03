using PaymentService.Domain.Entities;

namespace PaymentService.Domain.Interfaces;

public interface IPaymentGateway
{
    /// <summary>
    /// Processes a payment through the provider (e.g., Stripe)
    /// </summary>
    /// <returns>Transaction ID if successful</returns>
    Task<PaymentResult> ProcessPaymentAsync(Payment payment, CancellationToken cancellationToken = default);
}

public sealed record PaymentResult(
    bool IsSuccess,
    string? TransactionId = null,
    string? ErrorMessage = null);
