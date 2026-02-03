using Microsoft.Extensions.Configuration;
using NotificationService.Domain.Interfaces;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace NotificationService.Infrastructure.Services;

public sealed class TwilioSmsService(IConfiguration configuration) : ISmsService
{
    private readonly string _accountSid = configuration["Twilio:AccountSid"] ?? "AC_mock";
    private readonly string _authToken = configuration["Twilio:AuthToken"] ?? "mock_token";
    private readonly string _fromNumber = configuration["Twilio:FromNumber"] ?? "+15005550006";

    public async Task<string> SendSmsAsync(string toPhoneNumber, string message, CancellationToken cancellationToken = default)
    {
        // Mock execution for development
        if (_accountSid.StartsWith("AC_mock"))
        {
            await Task.Delay(100, cancellationToken);
            return $"mock_sms_{Guid.NewGuid()}";
        }

        TwilioClient.Init(_accountSid, _authToken);

        var messageResource = await MessageResource.CreateAsync(
            body: message,
            from: new PhoneNumber(_fromNumber),
            to: new PhoneNumber(toPhoneNumber),
            client: TwilioClient.GetRestClient());

        if (messageResource.ErrorCode != null)
            throw new Exception($"Twilio failed: {messageResource.ErrorMessage}");

        return messageResource.Sid;
    }
}
