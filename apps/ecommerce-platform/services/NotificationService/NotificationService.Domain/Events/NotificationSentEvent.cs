namespace NotificationService.Domain.Events;

public sealed record NotificationSentEvent(
    Guid NotificationId,
    Guid UserId,
    string Type,
    string Recipient)
{
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}
