namespace UserService.Application.Interfaces;

/// <summary>
/// Service for JWT token generation and management
/// </summary>
public interface ITokenService
{
    string GenerateAccessToken(Guid userId, string email, List<string> roles);
    string GenerateRefreshToken();
}
