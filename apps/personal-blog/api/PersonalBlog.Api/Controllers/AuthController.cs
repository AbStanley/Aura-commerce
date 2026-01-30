using Microsoft.AspNetCore.Mvc;
using PersonalBlog.Api.Models;

namespace PersonalBlog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // Hardcoded credentials as per requirements
        if (request.Username == "admin" && request.Password == "admin")
        {
            return Ok(new { Token = "fake-jwt-token-for-demo-purposes" });
        }
        return Unauthorized();
    }
}
