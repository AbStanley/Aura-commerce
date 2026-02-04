using System.Security.Claims;
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
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var items = await context.Wishlists
            .Where(w => w.UserId == userId)
            .Select(w => w.ProductId)
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> AddToWishlist(Guid productId)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        
        if (await context.Wishlists.AnyAsync(w => w.UserId == userId && w.ProductId == productId))
            return Ok(); // Already exists

        context.Wishlists.Add(new Wishlist { UserId = userId, ProductId = productId });
        await context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromWishlist(Guid productId)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var item = await context.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);
        
        if (item != null)
        {
            context.Wishlists.Remove(item);
            await context.SaveChangesAsync();
        }
        return Ok();
    }

    private bool TryGetUserId(out Guid userId)
    {
        userId = Guid.Empty;
        var sub = User.FindFirst("sub")?.Value 
                  ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(sub, out userId);
    }
}
