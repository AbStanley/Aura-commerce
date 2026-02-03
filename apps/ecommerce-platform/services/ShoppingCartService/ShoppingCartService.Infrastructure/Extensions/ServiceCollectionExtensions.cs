using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ShoppingCartService.Domain.Interfaces;
using ShoppingCartService.Infrastructure.Repositories;

namespace ShoppingCartService.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureLayer(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
            options.InstanceName = "ShoppingCart_";
        });

        services.AddScoped<ICartRepository, RedisCartRepository>();

        return services;
    }
}
