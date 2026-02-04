using FluentAssertions;
using PaymentService.Domain.Entities;
using PaymentService.Domain.Enums;

namespace PaymentService.UnitTests.Domain;

public class PaymentDomainTests
{
    private readonly Guid _orderId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();

    [Fact]
    public void Create_ShouldInitializeCorrectly()
    {
        // Act
        var payment = Payment.Create(_orderId, _userId, 99.99m, "usd", "pm_test_123");

        // Assert
        payment.Should().NotBeNull();
        payment.OrderId.Should().Be(_orderId);
        payment.UserId.Should().Be(_userId);
        payment.Amount.Should().Be(99.99m);
        payment.Currency.Should().Be("usd");
        payment.PaymentMethodId.Should().Be("pm_test_123");
        payment.Status.Should().Be(PaymentStatus.Pending);
        payment.TransactionId.Should().BeNull();
        payment.FailureMessage.Should().BeNull();
        payment.ProcessedAt.Should().BeNull();
    }

    [Fact]
    public void MarkCompleted_ShouldTransitionToCompleted()
    {
        // Arrange
        var payment = Payment.Create(_orderId, _userId, 50.00m, "usd", "pm_test_456");
        var transactionId = "pi_test_txn_123";

        // Act
        payment.MarkCompleted(transactionId);

        // Assert
        payment.Status.Should().Be(PaymentStatus.Completed);
        payment.TransactionId.Should().Be(transactionId);
        payment.ProcessedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void MarkCompleted_WhenAlreadyCompleted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = Payment.Create(_orderId, _userId, 50.00m, "usd", "pm_test_456");
        payment.MarkCompleted("txn_1");

        // Act
        var act = () => payment.MarkCompleted("txn_2");

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage($"Cannot complete payment in {PaymentStatus.Completed} status");
    }

    [Fact]
    public void MarkFailed_ShouldTransitionToFailed()
    {
        // Arrange
        var payment = Payment.Create(_orderId, _userId, 75.00m, "eur", "pm_test_789");
        var failureReason = "Card declined";

        // Act
        payment.MarkFailed(failureReason);

        // Assert
        payment.Status.Should().Be(PaymentStatus.Failed);
        payment.FailureMessage.Should().Be(failureReason);
        payment.ProcessedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void MarkRefunded_ShouldTransitionToRefunded()
    {
        // Arrange
        var payment = Payment.Create(_orderId, _userId, 100.00m, "usd", "pm_test_refund");
        payment.MarkCompleted("txn_refund_test");

        // Act
        payment.MarkRefunded();

        // Assert
        payment.Status.Should().Be(PaymentStatus.Refunded);
    }

    [Fact]
    public void MarkRefunded_WhenNotCompleted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = Payment.Create(_orderId, _userId, 100.00m, "usd", "pm_test_refund");

        // Act
        var act = () => payment.MarkRefunded();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage($"Cannot refund payment in {PaymentStatus.Pending} status");
    }

    [Fact]
    public void MarkRefunded_WhenFailed_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = Payment.Create(_orderId, _userId, 100.00m, "usd", "pm_test_refund");
        payment.MarkFailed("Some failure");

        // Act
        var act = () => payment.MarkRefunded();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage($"Cannot refund payment in {PaymentStatus.Failed} status");
    }
}
