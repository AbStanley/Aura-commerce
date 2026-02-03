using Shared.Infrastructure.Entities;

namespace UserService.Domain.Entities;

/// <summary>
/// User entity representing a registered user
/// </summary>
public sealed class User : BaseEntity
{
    public required string Email { get; init; }
    public required string PasswordHash { get; init; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public List<string> Roles { get; set; } = ["User"];
    public bool IsActive { get; set; } = true;

    public static User Create(string email, string passwordHash, string firstName, string lastName)
        => new()
        {
            Email = email,
            PasswordHash = passwordHash,
            FirstName = firstName,
            LastName = lastName
        };
}
