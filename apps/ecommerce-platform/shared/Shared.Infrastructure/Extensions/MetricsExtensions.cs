using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Prometheus;

namespace Shared.Infrastructure.Extensions;

/// <summary>
/// Prometheus metrics extensions
/// </summary>
public static class MetricsExtensions
{
    /// <summary>
    /// Adds Prometheus metrics collection to the service
    /// </summary>
    public static IServiceCollection AddPrometheusMetrics(this IServiceCollection services)
    {
        // Metrics are collected automatically by prometheus-net
        return services;
    }

    /// <summary>
    /// Configures Prometheus HTTP metrics and /metrics endpoint
    /// </summary>
    public static IApplicationBuilder UsePrometheusMetrics(this IApplicationBuilder app)
    {
        app.UseHttpMetrics();
        return app;
    }

    /// <summary>
    /// Maps the /metrics endpoint for Prometheus scraping
    /// </summary>
    public static void MapPrometheusMetrics(this Microsoft.AspNetCore.Routing.IEndpointRouteBuilder endpoints)
    {
        endpoints.MapMetrics();
    }
}
