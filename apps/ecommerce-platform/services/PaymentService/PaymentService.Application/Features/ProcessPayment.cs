using FluentValidation;
using MediatR;
using Shared.Common.Results;
using PaymentService.Domain.Entities;
using PaymentService.Domain.Interfaces;

namespace PaymentService.Application.Features;

public sealed record ProcessPaymentCommand(
    Guid OrderId,
    Guid UserId,
    decimal Amount,
    string Currency,
    string PaymentMethodId) : IRequest<Result<Guid>>;

public sealed class ProcessPaymentValidator : AbstractValidator<ProcessPaymentCommand>
{
    public ProcessPaymentValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3); // e.g. "USD"
        RuleFor(x => x.PaymentMethodId).NotEmpty();
    }
}

public sealed class ProcessPaymentHandler(
    IPaymentRepository paymentRepository,
    IPaymentGateway paymentGateway) : IRequestHandler<ProcessPaymentCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(ProcessPaymentCommand request, CancellationToken cancellationToken)
    {
        // 1. Create Payment record (Pending)
        var payment = Payment.Create(
            request.OrderId,
            request.UserId,
            request.Amount,
            request.Currency.ToLower(),
            request.PaymentMethodId);

        await paymentRepository.AddAsync(payment, cancellationToken);

        // 2. Call Gateway
        var gatewayResult = await paymentGateway.ProcessPaymentAsync(payment, cancellationToken);

        // 3. Update Status
        if (gatewayResult.IsSuccess)
        {
            payment.MarkCompleted(gatewayResult.TransactionId!);
        }
        else
        {
            payment.MarkFailed(gatewayResult.ErrorMessage ?? "Unknown gateway error");
        }

        await paymentRepository.UpdateAsync(payment, cancellationToken);

        return gatewayResult.IsSuccess
            ? Result<Guid>.Success(payment.Id)
            : Result<Guid>.Failure(gatewayResult.ErrorMessage ?? "Payment failed");
    }
}
