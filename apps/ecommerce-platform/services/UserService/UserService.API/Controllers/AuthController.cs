using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Constants;
using UserService.Application.Features.Registration;
using UserService.Application.Features.Authentication;

namespace UserService.API.Controllers;

[ApiController]
public sealed class AuthController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpPost(ApiRoutes.Auth.Register)]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess
            ? Ok(new { userId = result.Value })
            : BadRequest(new { error = result.Error });
    }

    [HttpPost(ApiRoutes.Auth.Login)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpPost(ApiRoutes.Auth.Refresh)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpPost(ApiRoutes.Auth.Logout)]
    public async Task<IActionResult> Logout()
    {
        var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? string.Empty);
        var command = new LogoutCommand(userId);
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    // Mock Social Login Endpoints (Simulating OIDC Redirects)
    [HttpGet("google")]
    public IActionResult KeyGoogleLogin()
    {
        //TODO: Implement actual Google OAuth 2.0 flow
        const string mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUtdXNlciIsImVtYWlsIjoiZGVtb0Bnb29nbGUuY29tIiwibmFtZSI6Ikdvb2dsZSBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        return Redirect($"http://localhost:4200/auth/callback?token={mockToken}&provider=Google");
    }

    [HttpGet("github")]
    public IActionResult GithubLogin()
    {
        //TODO: Implement actual GitHub OAuth 2.0 flow
        const string mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnaXRodWItdXNlciIsImVtYWlsIjoiZGVtb0BnaXRodWIuY29tIiwibmFtZSI6IkdpdEh1YiBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        return Redirect($"http://localhost:4200/auth/callback?token={mockToken}&provider=GitHub");
    }
}
