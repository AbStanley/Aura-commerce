using FluentAssertions;
using NSubstitute;
using Shared.Common.Results;
using ShoppingCartService.Application.Features.AddToCart;
using ShoppingCartService.Domain.Entities;
using ShoppingCartService.Domain.Interfaces;

namespace ShoppingCartService.UnitTests.Application;

public class AddToCartHandlerTests
{
    private readonly ICartRepository _cartRepository;
    private readonly AddToCartHandler _handler;

    public AddToCartHandlerTests()
    {
        _cartRepository = Substitute.For<ICartRepository>();
        _handler = new AddToCartHandler(_cartRepository);
    }

    [Fact]
    public async Task Handle_ShouldCreateNewCart_WhenCartDoesNotExist()
    {
        // Arrange
        var command = new AddToCartCommand(Guid.NewGuid(), Guid.NewGuid(), "Product A", 10.00m, 1);
        _cartRepository.GetByUserIdAsync(command.UserId, Arg.Any<CancellationToken>())
            .Returns((ShoppingCart?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        await _cartRepository.Received(1).SaveAsync(Arg.Is<ShoppingCart>(c =>
            c.UserId == command.UserId &&
            c.Items.Count == 1 &&
            c.Items.First().ProductId == command.ProductId
        ), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldAddItemToExistingCart_WhenCartExists()
    {
        // Arrange
        var command = new AddToCartCommand(Guid.NewGuid(), Guid.NewGuid(), "Product A", 10.00m, 1);
        var existingCart = ShoppingCart.Create(command.UserId);
        _cartRepository.GetByUserIdAsync(command.UserId, Arg.Any<CancellationToken>())
            .Returns(existingCart);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        await _cartRepository.Received(1).SaveAsync(Arg.Is<ShoppingCart>(c =>
            c.UserId == command.UserId &&
            c.Items.Count == 1
        ), Arg.Any<CancellationToken>());
    }
}
