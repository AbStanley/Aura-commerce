using FluentValidation;
using MediatR;
using Shared.Common.Results;
using ShoppingCartService.Domain.Interfaces;

namespace ShoppingCartService.Application.Features;

public sealed record UpdateCartItemCommand(
    Guid UserId,
    Guid ProductId,
    int Quantity) : IRequest<Result>;

public sealed class UpdateCartItemValidator : AbstractValidator<UpdateCartItemCommand>
{
    public UpdateCartItemValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0).LessThanOrEqualTo(100);
    }
}

public sealed class UpdateCartItemHandler(ICartRepository cartRepository) 
    : IRequestHandler<UpdateCartItemCommand, Result>
{
    public async Task<Result> Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
    {
        var cart = await cartRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        if (cart is null)
            return Result.Failure("Cart not found");

        cart.UpdateItemQuantity(request.ProductId, request.Quantity);

        await cartRepository.SaveAsync(cart, cancellationToken);

        return Result.Success();
    }
}
