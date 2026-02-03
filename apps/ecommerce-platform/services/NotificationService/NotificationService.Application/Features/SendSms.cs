using FluentValidation;
using MediatR;
using Shared.Common.Results;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Application.Features;

public sealed record SendSmsCommand(
    Guid UserId,
    string PhoneNumber,
    string Message) : IRequest<Result<Guid>>;

public sealed class SendSmsValidator : AbstractValidator<SendSmsCommand>
{
    public SendSmsValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(160); // Standard SMS length
    }
}

public sealed class SendSmsHandler(
    INotificationRepository notificationRepository,
    ISmsService smsService) : IRequestHandler<SendSmsCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(SendSmsCommand request, CancellationToken cancellationToken)
    {
        // 1. Create Notification record
        var notification = Notification.CreateSms(
            request.UserId,
            request.PhoneNumber,
            request.Message);

        await notificationRepository.AddAsync(notification, cancellationToken);

        // 2. Send SMS via Gateway
        try
        {
            var externalId = await smsService.SendSmsAsync(
                request.PhoneNumber,
                request.Message,
                cancellationToken);

            notification.MarkSent(externalId);
        }
        catch (Exception ex)
        {
            notification.MarkFailed(ex.Message);
        }

        // 3. Update Status
        await notificationRepository.UpdateAsync(notification, cancellationToken);

        return Result<Guid>.Success(notification.Id);
    }
}
