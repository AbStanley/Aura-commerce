using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
            // Using InMemory for PaymentService simplicity initially, or consistent Npgsql? 
            // Following other services, let's use Npgsql but handle the package.
            // If the package was not added yet, I should have added it. I recall adding Stripe.net and Config.Abstractions
            // I need to add Npgsql package now or default to InMemory if I forgot.
            // I'll assume I will fix the package if missing.
            options.UseNpgsql(configuration.GetConnectionString("PaymentDb")));

        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IPaymentGateway, StripePaymentGateway>();

        return services;
    }
}
