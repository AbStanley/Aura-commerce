using FluentAssertions;
using ShoppingCartService.Domain.Entities;

namespace ShoppingCartService.UnitTests.Domain;

public class ShoppingCartDomainTests
{
    private readonly Guid _userId = Guid.NewGuid();

    [Fact]
    public void Create_ShouldInitializeCorrectly()
    {
        // Act
        var cart = ShoppingCart.Create(_userId);

        // Assert
        cart.UserId.Should().Be(_userId);
        cart.Items.Should().BeEmpty();
        cart.TotalAmount.Should().Be(0);
        cart.TotalItems.Should().Be(0);
    }

    [Fact]
    public void AddItem_ShouldAddNewItem_WhenItemDoesNotExist()
    {
        // Arrange
        var cart = ShoppingCart.Create(_userId);
        var item = CartItem.Create(Guid.NewGuid(), "Product A", 10.00m, 1);

        // Act
        cart.AddItem(item);

        // Assert
        cart.Items.Should().HaveCount(1);
        cart.TotalItems.Should().Be(1);
        cart.TotalAmount.Should().Be(10.00m);
    }

    [Fact]
    public void AddItem_ShouldUpdateQuantity_WhenItemExists()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var cart = ShoppingCart.Create(_userId);
        cart.AddItem(CartItem.Create(productId, "Product A", 10.00m, 1));
        
        var newItem = CartItem.Create(productId, "Product A", 10.00m, 2);

        // Act
        cart.AddItem(newItem);

        // Assert
        cart.Items.Should().HaveCount(1);
        cart.Items.First().Quantity.Should().Be(3);
        cart.TotalItems.Should().Be(3);
        cart.TotalAmount.Should().Be(30.00m);
    }

    [Fact]
    public void RemoveItem_ShouldRemoveItem_WhenExists()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var cart = ShoppingCart.Create(_userId);
        cart.AddItem(CartItem.Create(productId, "Product A", 10.00m, 1));

        // Act
        cart.RemoveItem(productId);

        // Assert
        cart.Items.Should().BeEmpty();
        cart.TotalItems.Should().Be(0);
    }

    [Fact]
    public void UpdateItemQuantity_ShouldUpdateQuantity()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var cart = ShoppingCart.Create(_userId);
        cart.AddItem(CartItem.Create(productId, "Product A", 10.00m, 1));

        // Act
        cart.UpdateItemQuantity(productId, 5);

        // Assert
        cart.Items.First().Quantity.Should().Be(5);
        cart.TotalAmount.Should().Be(50.00m);
    }

    [Fact]
    public void UpdateItemQuantity_ShouldRemoveItem_WhenQuantityIsZeroOrLess()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var cart = ShoppingCart.Create(_userId);
        cart.AddItem(CartItem.Create(productId, "Product A", 10.00m, 1));

        // Act
        cart.UpdateItemQuantity(productId, 0);

        // Assert
        cart.Items.Should().BeEmpty();
    }

    [Fact]
    public void Clear_ShouldRemoveAllItems()
    {
        // Arrange
        var cart = ShoppingCart.Create(_userId);
        cart.AddItem(CartItem.Create(Guid.NewGuid(), "Product A", 10.00m, 1));
        cart.AddItem(CartItem.Create(Guid.NewGuid(), "Product B", 20.00m, 1));

        // Act
        cart.Clear();

        // Assert
        cart.Items.Should().BeEmpty();
        cart.TotalAmount.Should().Be(0);
    }
}
