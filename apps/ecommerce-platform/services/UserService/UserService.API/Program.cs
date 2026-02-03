using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using UserService.API.Middleware;
using UserService.Application.Extensions;
using UserService.Infrastructure.Extensions;
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
        configuration.ConfigureSharedLogger(context.Configuration, "UserService"));

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();

    builder.Services.AddApplicationLayer();
    builder.Services.AddInfrastructureLayer(builder.Configuration);

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
            };
        });

    builder.Services.AddAuthorization();

    builder.Services.AddCommonHealthChecks(builder.Configuration);

    var app = builder.Build();

    // Auto-create database schema (development only)
    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<UserService.Infrastructure.Persistence.UserDbContext>();
        db.Database.EnsureCreated();
        
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseSerilogRequestLogging();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapHealthChecks("/health");

    Log.Information("Starting User Service");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "User Service failed to start");
}
finally
{
    Log.CloseAndFlush();
}
