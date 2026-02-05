using Shared.Domain.Entities;

namespace UserService.Domain.Entities;

/// <summary>
/// User entity representing a registered user
/// </summary>
public sealed class User : BaseEntity
{
    public required string Email { get; init; }
    public string? PasswordHash { get; init; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? Provider { get; set; }
    public string? ProviderKey { get; set; }
    public List<string> Roles { get; set; } = ["User"];
    public bool IsActive { get; set; } = true;

    public static User Create(string email, string? passwordHash, string firstName, string lastName)
        => new()
        {
            Email = email,
            PasswordHash = passwordHash,
            FirstName = firstName,
            LastName = lastName
        };

    public static User CreateExternal(string email, string provider, string providerKey, string firstName, string lastName)
        => new()
        {
            Email = email,
            Provider = provider,
            ProviderKey = providerKey,
            FirstName = firstName,
            LastName = lastName,
            PasswordHash = null
        };
}
