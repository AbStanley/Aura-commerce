using Microsoft.Extensions.DependencyInjection;
using Shared.Contracts.Interfaces;
using Shared.Infrastructure.Messaging;

namespace Shared.Infrastructure.Extensions;

/// <summary>
/// Service collection extensions for shared infrastructure
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSharedInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IEventPublisher, MassTransitEventPublisher>();
        return services;
    }
}
