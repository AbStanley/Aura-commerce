using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.Features;

namespace NotificationService.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public sealed class NotificationsController(ISender sender) : ControllerBase
{
    [HttpPost("email")]
    public async Task<IActionResult> SendEmail([FromBody] SendEmailCommand command)
    {
        var result = await sender.Send(command);
        return result.IsSuccess
            ? Ok(new { notificationId = result.Value })
            : BadRequest(new { error = result.Error });
    }

    [HttpPost("sms")]
    public async Task<IActionResult> SendSms([FromBody] SendSmsCommand command)
    {
        var result = await sender.Send(command);
        return result.IsSuccess
            ? Ok(new { notificationId = result.Value })
            : BadRequest(new { error = result.Error });
    }
}
