using PersonalBlog.Core.Entities;

namespace PersonalBlog.Core.Interfaces;

public interface IArticleRepository
{
    Task<IEnumerable<Article>> GetAllAsync();
    Task<Article?> GetByIdAsync(Guid id);
    Task AddAsync(Article article);
    Task UpdateAsync(Article article);
    Task DeleteAsync(Guid id);
}
