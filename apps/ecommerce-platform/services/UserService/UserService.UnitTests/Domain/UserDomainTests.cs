using FluentAssertions;
using UserService.Domain.Entities;

namespace UserService.UnitTests.Domain;

public class UserDomainTests
{
    [Fact]
    public void Create_ShouldInitializeCorrectly()
    {
        // Act
        var user = User.Create(
            "test@example.com",
            "hashed_password_123",
            "John",
            "Doe");

        // Assert
        user.Should().NotBeNull();
        user.Email.Should().Be("test@example.com");
        user.PasswordHash.Should().Be("hashed_password_123");
        user.FirstName.Should().Be("John");
        user.LastName.Should().Be("Doe");
        user.IsActive.Should().BeTrue();
        user.Roles.Should().ContainSingle();
        user.Roles.Should().Contain("User");
    }

    [Fact]
    public void Create_ShouldDefaultToActiveWithUserRole()
    {
        // Act
        var user = User.Create("active@example.com", "hash", "Jane", "Smith");

        // Assert
        user.IsActive.Should().BeTrue();
        user.Roles.Should().Contain("User");
    }

    [Fact]
    public void User_ShouldAllowRoleAssignment()
    {
        // Arrange
        var user = User.Create("admin@example.com", "hash", "Admin", "User");

        // Act
        user.Roles.Add("Admin");

        // Assert
        user.Roles.Should().HaveCount(2);
        user.Roles.Should().Contain("User");
        user.Roles.Should().Contain("Admin");
    }

    [Fact]
    public void User_ShouldAllowDeactivation()
    {
        // Arrange
        var user = User.Create("deactivate@example.com", "hash", "Test", "User");

        // Act
        user.IsActive = false;

        // Assert
        user.IsActive.Should().BeFalse();
    }

    [Fact]
    public void User_ShouldAllowNameUpdates()
    {
        // Arrange
        var user = User.Create("update@example.com", "hash", "Original", "Name");

        // Act
        user.FirstName = "Updated";
        user.LastName = "FullName";

        // Assert
        user.FirstName.Should().Be("Updated");
        user.LastName.Should().Be("FullName");
    }

    [Fact]
    public void User_ShouldAllowMultipleRoles()
    {
        // Arrange
        var user = User.Create("multirole@example.com", "hash", "Multi", "Role");

        // Act
        user.Roles.Add("Admin");
        user.Roles.Add("Moderator");

        // Assert
        user.Roles.Should().HaveCount(3);
        user.Roles.Should().Contain(["User", "Admin", "Moderator"]);
    }
}
