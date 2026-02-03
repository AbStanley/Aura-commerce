using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OrderService.Domain.Interfaces;
using OrderService.Infrastructure.Persistence;
using OrderService.Infrastructure.Repositories;

namespace OrderService.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureLayer(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<OrderDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("OrderDb")));

        services.AddScoped<IOrderRepository, OrderRepository>();

        return services;
    }
}
