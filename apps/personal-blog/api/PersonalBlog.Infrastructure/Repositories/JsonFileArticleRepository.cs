using System.Text.Json;
using PersonalBlog.Core.Entities;
using PersonalBlog.Core.Interfaces;

namespace PersonalBlog.Infrastructure.Repositories;

public class JsonFileArticleRepository : IArticleRepository
{
    private readonly string _storagePath;
    private readonly JsonSerializerOptions _jsonOptions;

    public JsonFileArticleRepository(string contentRootPath)
    {
        _storagePath = Path.Combine(contentRootPath, "data");
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
        _jsonOptions = new JsonSerializerOptions { WriteIndented = true };
    }

    private string GetFilePath(Guid id) => Path.Combine(_storagePath, $"{id}.json");

    public async Task<IEnumerable<Article>> GetAllAsync()
    {
        var files = Directory.GetFiles(_storagePath, "*.json");
        var articles = new List<Article>();

        foreach (var file in files)
        {
            try 
            {
                using var stream = File.OpenRead(file);
                var article = await JsonSerializer.DeserializeAsync<Article>(stream, _jsonOptions);
                if (article != null)
                {
                    articles.Add(article);
                }
            }
            catch (Exception)
            {
                // Ignore corrupted files for now, or log if we had a logger
            }
        }

        return articles.OrderByDescending(x => x.PublishedDate);
    }

    public async Task<Article?> GetByIdAsync(Guid id)
    {
        var path = GetFilePath(id);
        if (!File.Exists(path)) return null;

        using var stream = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<Article>(stream, _jsonOptions);
    }

    public async Task AddAsync(Article article)
    {
        var path = GetFilePath(article.Id);
        using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, article, _jsonOptions);
    }

    public async Task UpdateAsync(Article article)
    {
       // Same as Add for file storage (overwrite)
       await AddAsync(article);
    }

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
