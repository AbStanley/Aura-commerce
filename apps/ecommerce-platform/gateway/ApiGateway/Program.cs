using Shared.Infrastructure.Logging;
using Shared.Infrastructure.Extensions;
using Serilog;
using Yarp.ReverseProxy.Transforms;
using Scalar.AspNetCore;

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

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();

    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("Authenticated", policy => policy.RequireAuthenticatedUser());
    });

    builder.Services.AddCommonHealthChecks(builder.Configuration);

    var app = builder.Build();

    app.UseSerilogRequestLogging();
    
    app.UseAuthentication();
    app.UseAuthorization();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        
        // Serve individual Scalar UI for Gateway's own spec (minimal endpoints)
        app.MapScalarApiReference(options =>
        {
            options.Title = "API Gateway";
            options.Theme = ScalarTheme.BluePlanet;
        });
        
        // Individual Scalar docs for each service (via proxy)
        app.MapGet("/api-docs/users", () => Results.Content(ScalarPage("User Service", "/docs/users/openapi.json"), "text/html"));
        app.MapGet("/api-docs/products", () => Results.Content(ScalarPage("Product Service", "/docs/products/openapi.json"), "text/html"));
        app.MapGet("/api-docs/cart", () => Results.Content(ScalarPage("Cart Service", "/docs/cart/openapi.json"), "text/html"));
        app.MapGet("/api-docs/orders", () => Results.Content(ScalarPage("Order Service", "/docs/orders/openapi.json"), "text/html"));
        app.MapGet("/api-docs/payments", () => Results.Content(ScalarPage("Payment Service", "/docs/payments/openapi.json"), "text/html"));
        app.MapGet("/api-docs/notifications", () => Results.Content(ScalarPage("Notification Service", "/docs/notifications/openapi.json"), "text/html"));
        
        // Landing page with all services
        app.MapGet("/api-docs", () => Results.Content("""
            <!doctype html>
            <html>
            <head>
                <title>E-Commerce Platform API</title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: system-ui, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; color: #e2e8f0; }
                    .container { max-width: 1200px; margin: 0 auto; padding: 4rem 2rem; }
                    h1 { font-size: 2.5rem; text-align: center; margin-bottom: 0.5rem; background: linear-gradient(to right, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                    .subtitle { text-align: center; color: #94a3b8; margin-bottom: 3rem; }
                    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
                    .card { background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; transition: all 0.3s; text-decoration: none; color: inherit; }
                    .card:hover { transform: translateY(-4px); border-color: #60a5fa; box-shadow: 0 10px 40px rgba(96, 165, 250, 0.15); }
                    .card h2 { font-size: 1.25rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
                    .card p { color: #94a3b8; font-size: 0.875rem; }
                    .badge { background: #1e40af; color: #dbeafe; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🛒 E-Commerce Platform API</h1>
                    <p class="subtitle">Interactive documentation for all microservices</p>
                    <div class="grid">
                        <a href="/api-docs/users" class="card"><h2>🔐 User Service <span class="badge">Auth</span></h2><p>Registration, login, JWT tokens, user profiles</p></a>
                        <a href="/api-docs/products" class="card"><h2>📦 Product Service</h2><p>Product catalog, categories, search, inventory</p></a>
                        <a href="/api-docs/cart" class="card"><h2>🛒 Cart Service <span class="badge">Redis</span></h2><p>Shopping cart management, add/remove items</p></a>
                        <a href="/api-docs/orders" class="card"><h2>📜 Order Service <span class="badge">Saga</span></h2><p>Order placement, status tracking, history</p></a>
                        <a href="/api-docs/payments" class="card"><h2>💳 Payment Service</h2><p>Payment processing, refunds, transactions</p></a>
                        <a href="/api-docs/notifications" class="card"><h2>🔔 Notification Service</h2><p>Email, SMS, push notification delivery</p></a>
                    </div>
                </div>
            </body>
            </html>
            """, "text/html"));
    }

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

// Helper to generate Scalar HTML for a service
static string ScalarPage(string title, string specUrl) =>
    "<!doctype html><html><head>" +
    $"<title>{title} - API Documentation</title>" +
    "<meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />" +
    "<style>body { margin: 0; }</style></head><body>" +
    $"<script id=\"api-reference\" data-url=\"{specUrl}\" " +
    "data-configuration='{\"theme\":\"bluePlanet\"}'></script>" +
    "<script src=\"https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.0\"></script>" +
    "</body></html>";
