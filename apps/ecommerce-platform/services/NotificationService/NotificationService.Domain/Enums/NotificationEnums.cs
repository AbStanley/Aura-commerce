namespace NotificationService.Domain.Enums;

public enum NotificationType
{
    Email = 0,
    Sms = 1
}

public enum NotificationStatus
{
    Pending = 0,
    Sent = 1,
    Failed = 2
}
