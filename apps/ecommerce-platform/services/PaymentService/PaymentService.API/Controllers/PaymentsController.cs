using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaymentService.Application.Features;

namespace PaymentService.API.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public sealed class PaymentsController(ISender sender) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentCommand command)
    {
        var result = await sender.Send(command);
        return result.IsSuccess
            ? Ok(new { paymentId = result.Value })
            : BadRequest(new { error = result.Error });
    }

    [HttpGet("order/{orderId}")]
    public async Task<IActionResult> GetByOrder(Guid orderId)
    {
        var query = new GetPaymentByOrderQuery(orderId);
        var result = await sender.Send(query);
        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }
}
