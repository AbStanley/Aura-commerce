namespace Shared.Common.Extensions;

/// <summary>
/// Extension methods for DateTime operations
/// </summary>
public static class DateTimeExtensions
{
    public static DateTime ToUtc(this DateTime dateTime)
        => dateTime.Kind == DateTimeKind.Utc
            ? dateTime
            : dateTime.ToUniversalTime();

    public static bool IsInPast(this DateTime dateTime)
        => dateTime < DateTime.UtcNow;

    public static bool IsInFuture(this DateTime dateTime)
        => dateTime > DateTime.UtcNow;
}
