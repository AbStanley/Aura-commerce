using MediatR;
using Shared.Common.Results;
using PaymentService.Domain.Entities;
using PaymentService.Domain.Interfaces;

namespace PaymentService.Application.Features;

public sealed record GetPaymentByOrderQuery(Guid OrderId) : IRequest<Result<PaymentDto>>;

public sealed record PaymentDto(
    Guid Id,
    Guid OrderId,
    decimal Amount,
    string Currency,
    string Status,
    string? TransactionId,
    string? FailureMessage,
    DateTime CreatedAt,
    DateTime? ProcessedAt);

public sealed class GetPaymentByOrderHandler(IPaymentRepository paymentRepository)
    : IRequestHandler<GetPaymentByOrderQuery, Result<PaymentDto>>
{
    public async Task<Result<PaymentDto>> Handle(GetPaymentByOrderQuery request, CancellationToken cancellationToken)
    {
        var payment = await paymentRepository.GetByOrderIdAsync(request.OrderId, cancellationToken);

        if (payment is null)
            return Result<PaymentDto>.Failure("Payment not found for this order");

        var dto = new PaymentDto(
            payment.Id,
            payment.OrderId,
            payment.Amount,
            payment.Currency,
            payment.Status.ToString(),
            payment.TransactionId,
            payment.FailureMessage,
            payment.CreatedAt,
            payment.ProcessedAt);

        return Result<PaymentDto>.Success(dto);
    }
}
