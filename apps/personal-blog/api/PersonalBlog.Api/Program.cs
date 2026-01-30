using PersonalBlog.Core.Interfaces;
using PersonalBlog.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddAuthorization();
builder.Services.AddOpenApi();

// Content Root Path for storing JSON files in a safe place
// We'll use the current directory or a specific data directory
builder.Services.AddScoped<IArticleRepository, JsonFileArticleRepository>(sp => 
    new JsonFileArticleRepository(builder.Environment.ContentRootPath));

// Enable CORS for Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularPolicy",
        policy => policy.WithOrigins("http://localhost:4200")
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AngularPolicy");
app.UseAuthorization();

app.MapGet("/", () => "Personal Blog API is running. Access endpoints at /api/articles");

app.MapControllers();

app.Run();

