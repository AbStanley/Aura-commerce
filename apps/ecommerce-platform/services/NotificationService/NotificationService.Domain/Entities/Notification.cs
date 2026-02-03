using Shared.Domain.Entities;
using NotificationService.Domain.Enums;

namespace NotificationService.Domain.Entities;

public sealed class Notification : BaseEntity
{
    public required Guid UserId { get; init; }
    public required NotificationType Type { get; init; }
    public required string Recipient { get; init; } // Email address or Phone number
    public required string Subject { get; init; }   // Subject for email, or start of SMS
    public required string Body { get; init; }
    public NotificationStatus Status { get; private set; } = NotificationStatus.Pending;
    public string? ExternalReferenceId { get; private set; } // SendGrid/Twilio ID
    public string? ErrorMessage { get; private set; }
    public int RetryCount { get; private set; }
    public DateTime? SentAt { get; private set; }

    public static Notification CreateEmail(Guid userId, string to, string subject, string body)
        => new()
        {
            UserId = userId,
            Type = NotificationType.Email,
            Recipient = to,
            Subject = subject,
            Body = body
        };

    public static Notification CreateSms(Guid userId, string phoneNumber, string message)
        => new()
        {
            UserId = userId,
            Type = NotificationType.Sms,
            Recipient = phoneNumber,
            Subject = "SMS",
            Body = message
        };

    public void MarkSent(string externalId)
    {
        Status = NotificationStatus.Sent;
        ExternalReferenceId = externalId;
        SentAt = DateTime.UtcNow;
    }

    public void MarkFailed(string error)
    {
        Status = NotificationStatus.Failed;
        ErrorMessage = error;
        RetryCount++;
    }
}
