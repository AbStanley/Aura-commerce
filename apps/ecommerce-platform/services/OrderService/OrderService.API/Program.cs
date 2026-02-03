using Serilog;
using OrderService.Application.Extensions;
using OrderService.Infrastructure.Extensions;
using Shared.Infrastructure.Extensions;

using Shared.Infrastructure.Logging;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, configuration) =>
        configuration.ConfigureSharedLogger(context.Configuration, "OrderService"));

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();

    builder.Services.AddApplicationLayer();
    builder.Services.AddInfrastructureLayer(builder.Configuration);

    builder.Services.AddAuthentication("Bearer")
        .AddJwtBearer();

    builder.Services.AddAuthorization();

    // Register MassTransit with Consumers from Application assembly
    builder.Services.AddEventBus(
        builder.Configuration, 
        typeof(OrderService.Application.Consumers.PaymentStatusConsumer).Assembly);

    builder.Services.AddHealthChecks();

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }

    app.UseSerilogRequestLogging();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapHealthChecks("/health");

    Log.Information("Starting Order Service");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Order Service failed to start");
}
finally
{
    Log.CloseAndFlush();
}
