using FluentAssertions;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Enums;

namespace NotificationService.UnitTests.Domain;

public class NotificationDomainTests
{
    private readonly Guid _userId = Guid.NewGuid();

    [Fact]
    public void CreateEmail_ShouldInitializeCorrectly()
    {
        // Act
        var notification = Notification.CreateEmail(
            _userId,
            "user@example.com",
            "Welcome!",
            "Thank you for registering.");

        // Assert
        notification.Should().NotBeNull();
        notification.UserId.Should().Be(_userId);
        notification.Type.Should().Be(NotificationType.Email);
        notification.Recipient.Should().Be("user@example.com");
        notification.Subject.Should().Be("Welcome!");
        notification.Body.Should().Be("Thank you for registering.");
        notification.Status.Should().Be(NotificationStatus.Pending);
        notification.RetryCount.Should().Be(0);
        notification.SentAt.Should().BeNull();
    }

    [Fact]
    public void CreateSms_ShouldInitializeCorrectly()
    {
        // Act
        var notification = Notification.CreateSms(
            _userId,
            "+1234567890",
            "Your order has shipped!");

        // Assert
        notification.Should().NotBeNull();
        notification.UserId.Should().Be(_userId);
        notification.Type.Should().Be(NotificationType.Sms);
        notification.Recipient.Should().Be("+1234567890");
        notification.Subject.Should().Be("SMS");
        notification.Body.Should().Be("Your order has shipped!");
        notification.Status.Should().Be(NotificationStatus.Pending);
    }

    [Fact]
    public void MarkSent_ShouldTransitionToSent()
    {
        // Arrange
        var notification = Notification.CreateEmail(_userId, "test@example.com", "Test", "Body");
        var externalId = "sendgrid_123";

        // Act
        notification.MarkSent(externalId);

        // Assert
        notification.Status.Should().Be(NotificationStatus.Sent);
        notification.ExternalReferenceId.Should().Be(externalId);
        notification.SentAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void MarkFailed_ShouldTransitionToFailed_AndIncrementRetryCount()
    {
        // Arrange
        var notification = Notification.CreateEmail(_userId, "test@example.com", "Test", "Body");
        var errorMessage = "SMTP connection failed";

        // Act
        notification.MarkFailed(errorMessage);

        // Assert
        notification.Status.Should().Be(NotificationStatus.Failed);
        notification.ErrorMessage.Should().Be(errorMessage);
        notification.RetryCount.Should().Be(1);
    }

    [Fact]
    public void MarkFailed_MultipleTimes_ShouldIncrementRetryCount()
    {
        // Arrange
        var notification = Notification.CreateEmail(_userId, "test@example.com", "Test", "Body");

        // Act
        notification.MarkFailed("Error 1");
        notification.MarkFailed("Error 2");
        notification.MarkFailed("Error 3");

        // Assert
        notification.RetryCount.Should().Be(3);
        notification.ErrorMessage.Should().Be("Error 3");
    }
}
