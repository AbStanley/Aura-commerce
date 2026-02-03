using System.Text.Json;
using PersonalBlog.Core.Entities;
using PersonalBlog.Core.Interfaces;

namespace PersonalBlog.Infrastructure.Repositories;

public class JsonFileArticleRepository(string contentRootPath) : IArticleRepository
{
    private readonly string _storagePath = InitializePath(contentRootPath);
    private readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

    private static string InitializePath(string rootPath)
    {
        var path = Path.Combine(rootPath, "data");
        Directory.CreateDirectory(path);
        return path;
    }

    private string GetFilePath(Guid id) => Path.Combine(_storagePath, $"{id}.json");

    public async Task<IEnumerable<Article>> GetAllAsync()
    {
        var files = Directory.GetFiles(_storagePath, "*.json");
        List<Article> articles = [];

        foreach (var file in files)
        {
            try
            {
                await using var stream = File.OpenRead(file);
                var article = await JsonSerializer.DeserializeAsync<Article>(stream, _jsonOptions);
                if (article is not null)
                {
                    articles.Add(article);
                }
            }
            catch
            {
                // Ignore corrupted files
            }
        }

        return articles.OrderByDescending(x => x.PublishedDate);
    }

    public async Task<Article?> GetByIdAsync(Guid id)
    {
        var path = GetFilePath(id);
        if (!File.Exists(path)) return null;

        await using var stream = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<Article>(stream, _jsonOptions);
    }

    public async Task AddAsync(Article article)
    {
        var path = GetFilePath(article.Id);
        await using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, article, _jsonOptions);
    }

    public Task UpdateAsync(Article article) => AddAsync(article);

    public Task DeleteAsync(Guid id)
    {
        var path = GetFilePath(id);
        if (File.Exists(path))
        {
            File.Delete(path);
        }
        return Task.CompletedTask;
    }
}
