using Serilog;
using NotificationService.Application.Extensions;
using NotificationService.Infrastructure.Extensions;
using Shared.Infrastructure.Extensions;


using Shared.Infrastructure.Logging;
using Scalar.AspNetCore;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, configuration) =>
        configuration.ConfigureSharedLogger(context.Configuration, "NotificationService"));

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();

    builder.Services.AddApplicationLayer();
    builder.Services.AddInfrastructureLayer(builder.Configuration);

    builder.Services.AddAuthentication("Bearer")
        .AddJwtBearer();

    builder.Services.AddAuthorization();

    // Register MassTransit with Consumers
    builder.Services.AddEventBus(
        builder.Configuration,
        typeof(NotificationService.Application.Consumers.OrderEventsConsumer).Assembly);

    builder.Services.AddCommonHealthChecks(builder.Configuration);

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseSerilogRequestLogging();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapHealthChecks("/health");

    Log.Information("Starting Notification Service");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Notification Service failed to start");
}
finally
{
    Log.CloseAndFlush();
}
