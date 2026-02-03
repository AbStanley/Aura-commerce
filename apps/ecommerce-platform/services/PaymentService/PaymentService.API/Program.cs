using Serilog;
using PaymentService.Application.Extensions;
using PaymentService.Infrastructure.Extensions;
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
        configuration.ConfigureSharedLogger(context.Configuration, "PaymentService"));

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
        typeof(PaymentService.Application.Consumers.OrderPlacedConsumer).Assembly);

    builder.Services.AddCommonHealthChecks(builder.Configuration);

    var app = builder.Build();

    // Auto-create database schema (development only)
    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<PaymentService.Infrastructure.Persistence.PaymentDbContext>();
        db.Database.EnsureCreated();
        
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseSerilogRequestLogging();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapHealthChecks("/health");

    Log.Information("Starting Payment Service");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Payment Service failed to start");
}
finally
{
    Log.CloseAndFlush();
}
