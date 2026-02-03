using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Constants;
using UserService.Application.Features.Profile;

namespace UserService.API.Controllers;

[ApiController]
[Authorize]
public sealed class UserController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpGet(ApiRoutes.Users.GetById)]
    public async Task<IActionResult> GetProfile(Guid id)
    {
        var query = new GetUserProfileQuery(id);
        var result = await _sender.Send(query);
        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [HttpPut(ApiRoutes.Users.UpdateProfile)]
    public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateProfileRequest request)
    {
        var command = new UpdateUserProfileCommand(id, request.FirstName, request.LastName);
        var result = await _sender.Send(command);
        return result.IsSuccess
            ? Ok()
            : BadRequest(new { error = result.Error });
    }
}

public sealed record UpdateProfileRequest(string FirstName, string LastName);
