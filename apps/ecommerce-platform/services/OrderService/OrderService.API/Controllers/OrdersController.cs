using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Constants;
using OrderService.Application.Features;

namespace OrderService.API.Controllers;

[ApiController]
[Authorize]
public sealed class OrdersController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpPost(ApiRoutes.Orders.Base)]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetOrder), new { id = result.Value }, new { orderId = result.Value })
            : BadRequest(new { error = result.Error });
    }

    [HttpGet(ApiRoutes.Orders.GetById)]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var query = new GetOrderQuery(id);
        var result = await _sender.Send(query);
        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpGet(ApiRoutes.Orders.History)]
    public async Task<IActionResult> GetHistory([FromQuery] Guid userId)
    {
        var query = new GetUserOrdersQuery(userId);
        var result = await _sender.Send(query);
        return Ok(result.Value);
    }

    [HttpPost(ApiRoutes.Orders.Cancel)]
    public async Task<IActionResult> Cancel(Guid id, [FromQuery] Guid userId)
    {
        var command = new CancelOrderCommand(id, userId);
        var result = await _sender.Send(command);
        return result.IsSuccess
            ? Ok()
            : BadRequest(new { error = result.Error });
    }
}
