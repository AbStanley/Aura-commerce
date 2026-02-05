using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Constants;
using UserService.Application.Features.Registration;
using UserService.Application.Features.Authentication;
using UserService.Application.Features.Authentication.LoginWithExternalProvider;
using Microsoft.AspNetCore.Authentication;

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

    [HttpGet("/api/auth/external-login/{provider}")]
    public IActionResult ExternalLogin(string provider)
    {
        var properties = new Microsoft.AspNetCore.Authentication.AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(ExternalLoginCallback))
        };
        return Challenge(properties, provider);
    }

    [HttpGet("/api/auth/external-callback")]
    public async Task<IActionResult> ExternalLoginCallback()
    {
        var result = await HttpContext.AuthenticateAsync("ExternalCookie");
        if (!result.Succeeded)
            return BadRequest(new { error = "External authentication failed" });

        var claims = result.Principal.Claims;
        var email = claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
        var name = claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Name)?.Value;
        var firstName = claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.GivenName)?.Value ?? name?.Split(' ').FirstOrDefault() ?? "User";
        var lastName = claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Surname)?.Value ?? name?.Split(' ').LastOrDefault() ?? "External";
        var provider = result.Properties?.Items.ContainsKey(".AuthScheme") == true ? result.Properties.Items[".AuthScheme"] : "Unknown";
        var providerKey = claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(email))
            return BadRequest(new { error = "Email claim not found" });

        var command = new LoginWithExternalProviderCommand(email, provider!, providerKey!, firstName, lastName);
        var authResult = await _sender.Send(command);

        if (authResult.IsSuccess)
        {
            // Redirect to Frontend with Token
            // WARN: passing token in URL is not secure for production but matches the mock implementation.
            return Redirect($"http://localhost:4200/auth/callback?token={authResult.Value.AccessToken}&refresh={authResult.Value.RefreshToken}&provider={provider}");
        }

        return BadRequest(new { error = authResult.Error });
    }
}
