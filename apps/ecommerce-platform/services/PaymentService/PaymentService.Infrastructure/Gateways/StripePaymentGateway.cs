using Microsoft.Extensions.Configuration;
using PaymentService.Domain.Entities;
using PaymentService.Domain.Interfaces;
using Stripe;

namespace PaymentService.Infrastructure.Gateways;

public sealed class StripePaymentGateway(IConfiguration configuration) : IPaymentGateway
{
    private readonly string _apiKey = configuration["Stripe:SecretKey"] ?? "sk_test_mock_key";

    public async Task<PaymentResult> ProcessPaymentAsync(Domain.Entities.Payment payment, CancellationToken cancellationToken = default)
    {
        // For development/testing without a real key, return success if amount < 1000
        if (_apiKey.StartsWith("sk_test_mock"))
        {
            if (payment.Amount > 10000) // Mock failure for large amounts
                return new PaymentResult(false, null, "Amount too large for mock gateway");

            return new PaymentResult(true, $"ch_mock_{Guid.NewGuid()}");
        }

        try
        {
            StripeConfiguration.ApiKey = _apiKey;

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(payment.Amount * 100), // Stripe expects cents
                Currency = payment.Currency,
                PaymentMethod = payment.PaymentMethodId,
                Confirm = true,
                ReturnUrl = "https://localhost:5000/payment/callback", // simplified
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                    AllowRedirects = "never" // simplified for API-only flow
                }
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options, cancellationToken: cancellationToken);

            if (intent.Status == "succeeded")
            {
                return new PaymentResult(true, intent.Id);
            }

            return new PaymentResult(false, null, $"Stripe status: {intent.Status}");
        }
        catch (StripeException ex)
        {
            return new PaymentResult(false, null, ex.Message);
        }
    }
}
