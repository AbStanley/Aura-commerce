using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.Behaviors;

namespace NotificationService.Application.Extensions;

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
