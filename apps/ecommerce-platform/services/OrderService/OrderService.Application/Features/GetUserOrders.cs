using MediatR;
using Shared.Common.Results;
using OrderService.Domain.Interfaces;
using static OrderService.Application.Features.OrderDto;

namespace OrderService.Application.Features;

public sealed record GetUserOrdersQuery(Guid UserId) : IRequest<Result<List<OrderDto>>>;

public sealed class GetUserOrdersHandler(IOrderRepository orderRepository)
    : IRequestHandler<GetUserOrdersQuery, Result<List<OrderDto>>>
{
    public async Task<Result<List<OrderDto>>> Handle(GetUserOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await orderRepository.GetByUserIdAsync(request.UserId, cancellationToken);

        var dtos = orders.Select(order => new OrderDto(
            order.Id,
            order.OrderNumber,
            order.UserId,
            order.Items.Select(i => new OrderItemDto(i.ProductId, i.ProductName, i.UnitPrice, i.Quantity, i.TotalPrice)).ToList(),
            new AddressDto(order.ShippingAddress.Street, order.ShippingAddress.City, order.ShippingAddress.State, order.ShippingAddress.PostalCode, order.ShippingAddress.Country),
            order.TotalAmount,
            order.Status,
            order.PaymentStatus,
            order.CreatedAt,
            order.ShippedAt,
            order.DeliveredAt)).ToList();

        return Result<List<OrderDto>>.Success(dtos);
    }
}
