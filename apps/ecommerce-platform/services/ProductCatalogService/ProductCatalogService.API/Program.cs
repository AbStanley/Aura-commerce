using Serilog;
using ProductCatalogService.Application.Extensions;
using ProductCatalogService.Infrastructure.Extensions;
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
        configuration.ConfigureSharedLogger(context.Configuration, "ProductCatalogService"));

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();

    builder.Services.AddApplicationLayer();
    builder.Services.AddInfrastructureLayer(builder.Configuration);

    // Authentication & Authorization
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

    builder.Services.AddAuthorization();

    builder.Services.AddCommonHealthChecks(builder.Configuration);

    var app = builder.Build();

    // Auto-create database schema (development only)
    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ProductCatalogService.Infrastructure.Persistence.ProductCatalogDbContext>();
        db.Database.EnsureCreated();
        
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseSerilogRequestLogging();
    app.UsePrometheusMetrics();
    
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapHealthChecks("/health");
    app.MapPrometheusMetrics();

    Log.Information("Starting Product Catalog Service");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Product Catalog Service failed to start");
}
finally
{
    Log.CloseAndFlush();
}
