using Microsoft.Extensions.Configuration;
using NotificationService.Domain.Interfaces;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace NotificationService.Infrastructure.Services;

public sealed class SendGridEmailService(IConfiguration configuration) : IEmailService
{
    private readonly string _apiKey = configuration["SendGrid:ApiKey"] ?? "SG.mock_key";
    private readonly string _fromEmail = configuration["SendGrid:FromEmail"] ?? "no-reply@ecommerce.com";
    private readonly string _fromName = configuration["SendGrid:FromName"] ?? "E-Commerce Platform";

    public async Task<string> SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        // Mock execution for development
        if (_apiKey.StartsWith("SG.mock"))
        {
            await Task.Delay(100, cancellationToken); // Simulate network
            return $"mock_email_{Guid.NewGuid()}";
        }

        var client = new SendGridClient(_apiKey);
        var msg = new SendGridMessage
        {
            From = new EmailAddress(_fromEmail, _fromName),
            Subject = subject,
            PlainTextContent = body,
            HtmlContent = body // Assuming simple body for now
        };
        msg.AddTo(new EmailAddress(to));

        var response = await client.SendEmailAsync(msg, cancellationToken);

        if (response.IsSuccessStatusCode)
            return response.Headers.GetValues("X-Message-Id").FirstOrDefault() ?? Guid.NewGuid().ToString();

        throw new Exception($"SendGrid failed with status code {response.StatusCode}");
    }
}
