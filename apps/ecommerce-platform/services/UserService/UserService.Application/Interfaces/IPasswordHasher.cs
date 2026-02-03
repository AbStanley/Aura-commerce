namespace UserService.Application.Interfaces;

/// <summary>
/// Service for password hashing and verification
/// </summary>
public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}
