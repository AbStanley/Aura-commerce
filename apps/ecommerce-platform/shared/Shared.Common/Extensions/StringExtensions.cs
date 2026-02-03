namespace Shared.Common.Extensions;

/// <summary>
/// Extension methods for string operations
/// </summary>
public static class StringExtensions
{
    public static bool IsNullOrEmpty(this string? value)
        => string.IsNullOrWhiteSpace(value);

    public static string ToTitleCase(this string value)
    {
        if (value.IsNullOrEmpty())
            return value ?? string.Empty;

        return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(value.ToLower());
    }

    public static string Truncate(this string value, int maxLength)
    {
        if (value.IsNullOrEmpty() || value.Length <= maxLength)
            return value ?? string.Empty;

        return $"{value[..maxLength]}...";
    }
}
