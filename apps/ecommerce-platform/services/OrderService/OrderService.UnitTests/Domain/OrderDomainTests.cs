using FluentAssertions;
using OrderService.Domain.Entities;
using OrderService.Domain.Enums;
using OrderService.Domain.ValueObjects;

namespace OrderService.UnitTests.Domain;

public class OrderDomainTests
{
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Address _shippingAddress = Address.Create("Street", "City", "State", "12345", "Country");
    private readonly List<OrderItem> _items =
    [
        OrderItem.Create(Guid.NewGuid(), "Product 1", 10.00m, 2),
        OrderItem.Create(Guid.NewGuid(), "Product 2", 20.00m, 1)
    ];

    [Fact]
    public void Create_ShouldInitializeCorrectly()
    {
        // Act
        var order = Order.Create(_userId, _shippingAddress, _items);

        // Assert
        order.Should().NotBeNull();
        order.UserId.Should().Be(_userId);
        order.ShippingAddress.Should().Be(_shippingAddress);
        order.Items.Should().HaveCount(2);
        order.Status.Should().Be(OrderStatus.Pending);
        order.PaymentStatus.Should().Be(PaymentStatus.Pending);
        order.TotalAmount.Should().Be(40.00m);
        order.OrderNumber.Should().StartWith("ORD-");
    }

    [Fact]
    public void TotalAmount_ShouldCalculateCorrectly()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);

        // Act & Assert
        order.TotalAmount.Should().Be(40.00m);
    }

    [Fact]
    public void Confirm_ShouldTransitionToConfirmed()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);

        // Act
        order.Confirm();

        // Assert
        order.Status.Should().Be(OrderStatus.Confirmed);
    }

    [Fact]
    public void Confirm_WhenAlreadyConfirmed_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);
        order.Confirm();

        // Act
        var act = () => order.Confirm();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage($"Cannot confirm order in {OrderStatus.Confirmed} status");
    }

    [Fact]
    public void StartProcessing_ShouldTransitionToProcessing()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);
        order.Confirm();

        // Act
        order.StartProcessing();

        // Assert
        order.Status.Should().Be(OrderStatus.Processing);
    }

    [Fact]
    public void Ship_ShouldTransitionToShipped_AndSetShippedAt()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);
        order.Confirm();
        order.StartProcessing();

        // Act
        order.Ship();

        // Assert
        order.Status.Should().Be(OrderStatus.Shipped);
        order.ShippedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Deliver_ShouldTransitionToDelivered_AndSetDeliveredAt()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);
        order.Confirm();
        order.StartProcessing();
        order.Ship();

        // Act
        order.Deliver();

        // Assert
        order.Status.Should().Be(OrderStatus.Delivered);
        order.DeliveredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Cancel_WhenPending_ShouldTransitionToCancelled()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);

        // Act
        order.Cancel();

        // Assert
        order.Status.Should().Be(OrderStatus.Cancelled);
    }

    [Fact]
    public void Cancel_WhenShipped_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);
        order.Confirm();
        order.StartProcessing();
        order.Ship();

        // Act
        var act = () => order.Cancel();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage($"Cannot cancel order in {OrderStatus.Shipped} status");
    }

    [Fact]
    public void MarkPaymentAuthorized_ShouldUpdatePaymentStatus()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);
        var transactionId = "txn_123";

        // Act
        order.MarkPaymentAuthorized(transactionId);

        // Assert
        order.PaymentStatus.Should().Be(PaymentStatus.Authorized);
        order.PaymentTransactionId.Should().Be(transactionId);
    }

    [Fact]
    public void MarkPaymentCaptured_WhenAuthorized_ShouldUpdatePaymentStatus()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);
        order.MarkPaymentAuthorized("txn_123");

        // Act
        order.MarkPaymentCaptured();

        // Assert
        order.PaymentStatus.Should().Be(PaymentStatus.Captured);
    }

    [Fact]
    public void MarkPaymentCaptured_WhenNotAuthorized_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);

        // Act
        var act = () => order.MarkPaymentCaptured();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("Payment must be authorized before capture");
    }

    [Fact]
    public void MarkPaymentFailed_ShouldUpdateStatusAndReason()
    {
        // Arrange
        var order = Order.Create(_userId, _shippingAddress, _items);
        var reason = "Insufficient funds";

        // Act
        order.MarkPaymentFailed(reason);

        // Assert
        order.PaymentStatus.Should().Be(PaymentStatus.Failed);
        order.Status.Should().Be(OrderStatus.Failed);
        order.PaymentFailureReason.Should().Be(reason);
    }
}
