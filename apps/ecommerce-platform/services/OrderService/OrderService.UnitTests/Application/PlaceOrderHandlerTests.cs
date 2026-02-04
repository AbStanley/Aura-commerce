using FluentAssertions;
using MassTransit;
using NSubstitute;
using OrderService.Application.Features;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;
using Shared.Contracts.Events;

namespace OrderService.UnitTests.Application;

public class PlaceOrderHandlerTests
{
    private readonly IOrderRepository _orderRepository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly PlaceOrderHandler _handler;

    public PlaceOrderHandlerTests()
    {
        _orderRepository = Substitute.For<IOrderRepository>();
        _publishEndpoint = Substitute.For<IPublishEndpoint>();
        _handler = new PlaceOrderHandler(_orderRepository, _publishEndpoint);
    }

    [Fact]
    public async Task Handle_ShouldCreateOrder_AndPublishEvent()
    {
        // Arrange
        var command = new PlaceOrderCommand(
            Guid.NewGuid(),
            [
                new OrderItemRequest(Guid.NewGuid(), "Product A", 10.00m, 1),
                new OrderItemRequest(Guid.NewGuid(), "Product B", 20.00m, 2)
            ],
            new AddressRequest("Street", "City", "State", "12345", "Country")
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        // Verify Repository Call
        await _orderRepository.Received(1).AddAsync(Arg.Is<Order>(o =>
            o.UserId == command.UserId &&
            o.Items.Count == 2 &&
            o.TotalAmount == 50.00m &&
            o.ShippingAddress.Street == command.ShippingAddress.Street
        ), Arg.Any<CancellationToken>());

        // Verify Event Published
        await _publishEndpoint.Received(1).Publish(Arg.Is<OrderPlacedEvent>(e =>
            e.UserId == command.UserId &&
            e.TotalAmount == 50.00m &&
            e.Items.Count == 2
        ), Arg.Any<CancellationToken>());
    }
}
