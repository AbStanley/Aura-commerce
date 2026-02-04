using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Domain.Entities;
using UserService.Infrastructure.Persistence;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController(UserDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? string.Empty);
        var items = await context.Wishlists
            .Where(w => w.UserId == userId)
            .Select(w => w.ProductId)
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> AddToWishlist(Guid productId)
    {
        var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? string.Empty);
        
        if (await context.Wishlists.AnyAsync(w => w.UserId == userId && w.ProductId == productId))
            return Ok(); // Already exists

        context.Wishlists.Add(new Wishlist { UserId = userId, ProductId = productId });
        await context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromWishlist(Guid productId)
    {
        var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? string.Empty);
        var item = await context.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);
        
        if (item != null)
        {
            context.Wishlists.Remove(item);
            await context.SaveChangesAsync();
        }
        return Ok();
    }
}
