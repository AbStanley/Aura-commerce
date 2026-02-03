using System.Text.RegularExpressions;

namespace UserService.Domain.ValueObjects;

/// <summary>
/// Email value object with validation
/// </summary>
public sealed partial record Email
{
    private const string EmailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";

    public string Value { get; }

    private Email(string value) => Value = value;

    public static Email? Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        email = email.Trim().ToLowerInvariant();

        return EmailRegex().IsMatch(email) ? new Email(email) : null;
    }

    [GeneratedRegex(EmailPattern, RegexOptions.IgnoreCase, "en-US")]
    private static partial Regex EmailRegex();

    public override string ToString() => Value;
}
