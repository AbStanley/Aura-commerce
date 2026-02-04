using Microsoft.Extensions.Configuration;
using PaymentService.Domain.Entities;
using PaymentService.Domain.Interfaces;
using Polly;
using Polly.Registry;
using Stripe;

namespace PaymentService.Infrastructure.Gateways;

public sealed class StripePaymentGateway : IPaymentGateway
{
    private readonly string _apiKey;
    private readonly ResiliencePipeline _pipeline;

    public StripePaymentGateway(IConfiguration configuration, ResiliencePipelineProvider<string> pipelineProvider)
    {
        _apiKey = configuration["Stripe:SecretKey"] ?? "sk_test_mock_key";
        _pipeline = pipelineProvider.GetPipeline("Stripe");
    }

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
            
            // Execute with Resilience Pipeline (Circuit Breaker + Retry + Timeout)
            var intent = await _pipeline.ExecuteAsync(
                async token => await service.CreateAsync(options, cancellationToken: token),
                cancellationToken);

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
        catch (Exception ex) // Catch Polly/Timeout exceptions
        {
            return new PaymentResult(false, null, $"Payment failed: {ex.Message}");
        }
    }
}
