using Shared.Infrastructure.Logging;
using Shared.Infrastructure.Extensions;
using Serilog;
using Yarp.ReverseProxy.Transforms;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, configuration) =>
        configuration.ConfigureSharedLogger(context.Configuration, "ApiGateway"));

    builder.Services.AddReverseProxy()
        .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

    builder.Services.AddAuthentication("Bearer")
        .AddJwtBearer("Bearer", options =>
        {
            options.Authority = builder.Configuration["Identity:Authority"]; // User Service URL
            options.RequireHttpsMetadata = false; // Internal dev
            options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateAudience = false
            };
        });

    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("Authenticated", policy => policy.RequireAuthenticatedUser());
    });

    builder.Services.AddCommonHealthChecks(builder.Configuration);

    var app = builder.Build();

    app.UseSerilogRequestLogging();
    
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapHealthChecks("/health");

    app.MapReverseProxy();

    Log.Information("Starting API Gateway");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "API Gateway failed to start");
}
finally
{
    Log.CloseAndFlush();
}
