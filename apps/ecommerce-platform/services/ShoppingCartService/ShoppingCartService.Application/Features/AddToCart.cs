using FluentValidation;
using MediatR;
using Shared.Common.Results;
using ShoppingCartService.Domain.Entities;
using ShoppingCartService.Domain.Interfaces;

namespace ShoppingCartService.Application.Features.AddToCart;

public sealed record AddToCartCommand(
    Guid UserId,
    Guid ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity) : IRequest<Result>;

public sealed class AddToCartValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.ProductName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.UnitPrice).GreaterThan(0);
        RuleFor(x => x.Quantity).GreaterThan(0).LessThanOrEqualTo(100);
    }
}

public sealed class AddToCartHandler(ICartRepository cartRepository) 
    : IRequestHandler<AddToCartCommand, Result>
{
    public async Task<Result> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await cartRepository.GetByUserIdAsync(request.UserId, cancellationToken)
            ?? ShoppingCart.Create(request.UserId);

        var item = CartItem.Create(
            request.ProductId,
            request.ProductName,
            request.UnitPrice,
            request.Quantity);

        cart.AddItem(item);

        await cartRepository.SaveAsync(cart, cancellationToken);

        return Result.Success();
    }
}
