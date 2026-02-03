using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using ProductCatalogService.Application.Behaviors;

namespace ProductCatalogService.Application.Extensions;

/// <summary>
/// DI registration for Application layer
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationLayer(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
