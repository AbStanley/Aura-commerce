using MediatR;
using Shared.Common.Results;
using OrderService.Domain.Interfaces;
using OrderService.Domain.Enums;

namespace OrderService.Application.Features;

public sealed record GetOrderQuery(Guid OrderId) : IRequest<Result<OrderDto>>;

public sealed record OrderDto(
    Guid Id,
    string OrderNumber,
    Guid UserId,
    List<OrderItemDto> Items,
    AddressDto ShippingAddress,
    decimal TotalAmount,
    OrderStatus Status,
    PaymentStatus PaymentStatus,
    DateTime CreatedAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt);

public sealed record OrderItemDto(
    Guid ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice);

public sealed record AddressDto(
    string Street,
    string City,
    string State,
    string PostalCode,
    string Country);

public sealed class GetOrderHandler(IOrderRepository orderRepository)
    : IRequestHandler<GetOrderQuery, Result<OrderDto>>
{
    public async Task<Result<OrderDto>> Handle(GetOrderQuery request, CancellationToken cancellationToken)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order is null)
            return Result<OrderDto>.Failure("Order not found");

        var dto = new OrderDto(
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
            order.DeliveredAt);

        return Result<OrderDto>.Success(dto);
    }
}
