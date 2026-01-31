using Microsoft.AspNetCore.Mvc;
using PersonalBlog.Core.Entities;
using PersonalBlog.Core.Interfaces;

namespace PersonalBlog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController(IArticleRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Article>>> GetAll()
    {
        return Ok(await repository.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Article>> GetById(Guid id)
    {
        var article = await repository.GetByIdAsync(id);
        if (article == null) return NotFound();
        return Ok(article);
    }

    // TODO: Add Authorization
    [HttpPost]
    public async Task<ActionResult<Article>> Create(Article article)
    {
        // Simple validation
        if (string.IsNullOrWhiteSpace(article.Title)) return BadRequest("Title is required");
        
        // Ensure ID is set if empty (though Entity handles this usually)
        if (article.Id == Guid.Empty) article.Id = Guid.NewGuid();
        
        article.PublishedDate = DateTime.UtcNow;

        await repository.AddAsync(article);
        return CreatedAtAction(nameof(GetById), new { id = article.Id }, article);
    }

    // TODO: Add Authorization
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, Article article)
    {
        if (id != article.Id) return BadRequest();

        var existing = await repository.GetByIdAsync(id);
        if (existing == null) return NotFound();

        await repository.UpdateAsync(article);
        return NoContent();
    }

    // TODO: Add Authorization
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var existing = await repository.GetByIdAsync(id);
        if (existing == null) return NotFound();

        await repository.DeleteAsync(id);
        return NoContent();
    }
}
