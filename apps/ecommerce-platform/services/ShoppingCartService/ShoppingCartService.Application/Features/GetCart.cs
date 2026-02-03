using MediatR;
using Shared.Common.Results;
using ShoppingCartService.Domain.Interfaces;

namespace ShoppingCartService.Application.Features;

public sealed record GetCartQuery(Guid UserId) : IRequest<Result<CartDto>>;

public sealed record CartDto(
    Guid UserId,
    List<CartItemDto> Items,
    decimal TotalAmount,
    int TotalItems);

public sealed record CartItemDto(
    Guid ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice);

public sealed class GetCartHandler(ICartRepository cartRepository) 
    : IRequestHandler<GetCartQuery, Result<CartDto>>
{
    public async Task<Result<CartDto>> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await cartRepository.GetByUserIdAsync(request.UserId, cancellationToken);

        if (cart is null)
            return Result<CartDto>.Success(new CartDto(request.UserId, [], 0, 0));

        var dto = new CartDto(
            cart.UserId,
            cart.Items.Select(i => new CartItemDto(
                i.ProductId,
                i.ProductName,
                i.UnitPrice,
                i.Quantity,
                i.TotalPrice)).ToList(),
            cart.TotalAmount,
            cart.TotalItems);

        return Result<CartDto>.Success(dto);
    }
}
