using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Shared.Infrastructure.Extensions;

public static class HealthCheckExtensions
{
    public static IServiceCollection AddCommonHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        var healthChecksBuilder = services.AddHealthChecks();

        // Database
        var dbConnectionString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrEmpty(dbConnectionString))
        {
            healthChecksBuilder.AddNpgSql(
                connectionString: dbConnectionString,
                name: "PostgreSQL",
                tags: new[] { "db", "ready" });
        }

        // Redis
        var redisConnectionString = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnectionString))
        {
            healthChecksBuilder.AddRedis(
                redisConnectionString: redisConnectionString,
                name: "Redis",
                tags: new[] { "cache", "ready" });
        }

        // RabbitMQ
        // We look for 'RabbitMQ:Host' in configuration
        var rabbitHost = configuration["RabbitMQ:Host"];
        if (!string.IsNullOrEmpty(rabbitHost))
        {
            // Defaulting port/creds if not explicitly set strings, usually sufficient for simple check
            var connectionString = $"amqp://guest:guest@{rabbitHost}:5672/";
            // healthChecksBuilder.AddRabbitMQ(
            //     rabbitConnectionString: connectionString,
            //     name: "RabbitMQ",
            //     tags: new[] { "bus", "ready" });
        }

        return services;
    }
}
