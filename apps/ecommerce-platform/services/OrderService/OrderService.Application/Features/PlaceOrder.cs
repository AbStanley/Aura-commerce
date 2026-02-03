using FluentValidation;
using MediatR;
using Shared.Common.Results;
using MassTransit;
using Shared.Contracts.Events;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;
using OrderService.Domain.ValueObjects;

namespace OrderService.Application.Features;

public sealed record PlaceOrderCommand(
    Guid UserId,
    List<OrderItemRequest> Items,
    AddressRequest ShippingAddress) : IRequest<Result<Guid>>;

public sealed record OrderItemRequest(
    Guid ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity);

public sealed record AddressRequest(
    string Street,
    string City,
    string State,
    string PostalCode,
    string Country);

public sealed class PlaceOrderValidator : AbstractValidator<PlaceOrderCommand>
{
    public PlaceOrderValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Order must have at least one item");
        RuleForEach(x => x.Items).SetValidator(new OrderItemRequestValidator());
        RuleFor(x => x.ShippingAddress).SetValidator(new AddressRequestValidator());
    }
}

public sealed class OrderItemRequestValidator : AbstractValidator<OrderItemRequest>
{
    public OrderItemRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.ProductName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.UnitPrice).GreaterThan(0);
        RuleFor(x => x.Quantity).GreaterThan(0).LessThanOrEqualTo(100);
    }
}

public sealed class AddressRequestValidator : AbstractValidator<AddressRequest>
{
    public AddressRequestValidator()
    {
        RuleFor(x => x.Street).NotEmpty().MaximumLength(200);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.State).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PostalCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
    }
}

public sealed class PlaceOrderHandler(
    IOrderRepository orderRepository,
    IPublishEndpoint publishEndpoint)
    : IRequestHandler<PlaceOrderCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(PlaceOrderCommand request, CancellationToken cancellationToken)
    {
        var address = Address.Create(
            request.ShippingAddress.Street,
            request.ShippingAddress.City,
            request.ShippingAddress.State,
            request.ShippingAddress.PostalCode,
            request.ShippingAddress.Country);

        var items = request.Items.Select(i => OrderItem.Create(
            i.ProductId,
            i.ProductName,
            i.UnitPrice,
            i.Quantity)).ToList();

        var order = Order.Create(request.UserId, address, items);

        await orderRepository.AddAsync(order, cancellationToken);

        var dtos = order.Items.Select(i => new OrderItemEventDto(
            ProductId: i.ProductId,
            ProductName: i.ProductName,
            Quantity: i.Quantity,
            UnitPrice: i.UnitPrice
        )).ToList();

        // Publish OrderPlacedEvent
        await publishEndpoint.Publish(new OrderPlacedEvent
        {
            OrderId = order.Id,
            UserId = order.UserId,
            TotalAmount = order.TotalAmount,
            Items = dtos,
            PlacedAt = DateTime.UtcNow
        }, cancellationToken);

        return Result<Guid>.Success(order.Id);
    }
}
