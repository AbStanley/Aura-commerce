using UserService.Application.Interfaces;

namespace UserService.Infrastructure.Services;

/// <summary>
/// BCrypt password hasher implementation
/// </summary>
public sealed class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
        => BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

    public bool VerifyPassword(string password, string passwordHash)
        => BCrypt.Net.BCrypt.Verify(password, passwordHash);
}
