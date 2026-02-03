using MediatR;
using Shared.Common.Results;
using OrderService.Domain.Interfaces;

namespace OrderService.Application.Features;

public sealed record CancelOrderCommand(Guid OrderId, Guid UserId) : IRequest<Result>;

public sealed class CancelOrderHandler(IOrderRepository orderRepository)
    : IRequestHandler<CancelOrderCommand, Result>
{
    public async Task<Result> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order is null)
            return Result.Failure("Order not found");

        if (order.UserId != request.UserId)
            return Result.Failure("Unauthorized");

        try
        {
            order.Cancel();
            await orderRepository.UpdateAsync(order, cancellationToken);
            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
