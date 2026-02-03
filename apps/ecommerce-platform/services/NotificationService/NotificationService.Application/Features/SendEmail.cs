using FluentValidation;
using MediatR;
using Shared.Common.Results;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Application.Features;

public sealed record SendEmailCommand(
    Guid UserId,
    string To,
    string Subject,
    string Body) : IRequest<Result<Guid>>;

public sealed class SendEmailValidator : AbstractValidator<SendEmailCommand>
{
    public SendEmailValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.To).NotEmpty().EmailAddress();
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Body).NotEmpty();
    }
}

public sealed class SendEmailHandler(
    INotificationRepository notificationRepository,
    IEmailService emailService) : IRequestHandler<SendEmailCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(SendEmailCommand request, CancellationToken cancellationToken)
    {
        // 1. Create Notification record
        var notification = Notification.CreateEmail(
            request.UserId,
            request.To,
            request.Subject,
            request.Body);

        await notificationRepository.AddAsync(notification, cancellationToken);

        // 2. Send Email via Gateway
        try
        {
            var externalId = await emailService.SendEmailAsync(
                request.To,
                request.Subject,
                request.Body,
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
