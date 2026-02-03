namespace NotificationService.Domain.Interfaces;

public interface IEmailService
{
    Task<string> SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
}

public interface ISmsService
{
    Task<string> SendSmsAsync(string toPhoneNumber, string message, CancellationToken cancellationToken = default);
}
