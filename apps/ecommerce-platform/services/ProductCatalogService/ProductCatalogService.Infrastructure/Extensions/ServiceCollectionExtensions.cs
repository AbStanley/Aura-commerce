using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProductCatalogService.Domain.Interfaces;
using ProductCatalogService.Infrastructure.Persistence;
using ProductCatalogService.Infrastructure.Repositories;

namespace ProductCatalogService.Infrastructure.Extensions;

/// <summary>
/// DI registration for Infrastructure layer
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureLayer(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ProductCatalogDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("ProductCatalogDb")));

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IInventoryRepository, InventoryRepository>();

        return services;
    }
}
