using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Constants;
using ShoppingCartService.Application.Features;
using ShoppingCartService.Application.Features.AddToCart;

namespace ShoppingCartService.API.Controllers;

[ApiController]
[Authorize]
public sealed class CartController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpPost(ApiRoutes.Cart.AddItem)]
    public async Task<IActionResult> AddItem([FromBody] AddToCartCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpGet(ApiRoutes.Cart.Base)]
    public async Task<IActionResult> GetCart([FromQuery] Guid userId)
    {
        var query = new GetCartQuery(userId);
        var result = await _sender.Send(query);
        return Ok(result.Value);
    }

    [HttpPut(ApiRoutes.Cart.UpdateItem)]
    public async Task<IActionResult> UpdateItem(Guid productId, [FromBody] UpdateItemRequest request)
    {
        var command = new UpdateCartItemCommand(request.UserId, productId, request.Quantity);
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpDelete(ApiRoutes.Cart.RemoveItem)]
    public async Task<IActionResult> RemoveItem(Guid productId, [FromQuery] Guid userId)
    {
        var command = new UpdateCartItemCommand(userId, productId, 0);
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpDelete(ApiRoutes.Cart.Base)]
    public async Task<IActionResult> ClearCart([FromQuery] Guid userId)
    {
        var command = new ClearCartCommand(userId);
        var result = await _sender.Send(command);
        return Ok();
    }
}

public sealed record UpdateItemRequest(Guid UserId, int Quantity);
