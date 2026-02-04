using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using PaymentService.Domain.Interfaces;
using PaymentService.Infrastructure.Gateways;
using PaymentService.Infrastructure.Persistence;
using PaymentService.Infrastructure.Repositories;

namespace PaymentService.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureLayer(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<PaymentDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.EnableRetryOnFailure()));

        // Resilience
        services.AddResiliencePipeline("Stripe", builder =>
        {
            builder.AddRetry(new Polly.Retry.RetryStrategyOptions
            {
                MaxRetryAttempts = 3,
                Delay = TimeSpan.FromSeconds(2),
                BackoffType = Polly.DelayBackoffType.Exponential
            });
            builder.AddCircuitBreaker(new Polly.CircuitBreaker.CircuitBreakerStrategyOptions
            {
                FailureRatio = 0.5,
                SamplingDuration = TimeSpan.FromSeconds(30),
                MinimumThroughput = 5,
                BreakDuration = TimeSpan.FromSeconds(30)
            });
            builder.AddTimeout(TimeSpan.FromSeconds(5));
        });

        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IPaymentGateway, StripePaymentGateway>();

        return services;
    }
}
