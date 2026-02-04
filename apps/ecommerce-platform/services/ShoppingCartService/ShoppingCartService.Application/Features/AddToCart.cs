using FluentValidation;
using MediatR;
using Shared.Common.Results;
using ShoppingCartService.Domain.Entities;
using ShoppingCartService.Domain.Interfaces;
using System.Net.Http.Json;

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

public sealed class AddToCartHandler(ICartRepository cartRepository, IHttpClientFactory httpClientFactory) 
    : IRequestHandler<AddToCartCommand, Result>
{
    public async Task<Result> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        try 
        {
            var client = httpClientFactory.CreateClient();
            var response = await client.GetFromJsonAsync<ProductDto>(
                $"http://product-service:8080/api/products/{request.ProductId}", 
                cancellationToken);

            if (response != null && response.StockQuantity < request.Quantity)
            {
                return Result.Failure($"Inventory.OutOfStock: Only {response.StockQuantity} items left in stock. You requested {request.Quantity}.");
            }
        } 
        catch (Exception ex) 
        {
            // Fail safe: If we cannot verify stock, do not proceed.
            return Result.Failure($"Inventory.CheckFailed: Unable to verify stock availability: {ex.Message}");
        }

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

// Minimal DTO for validation
internal record ProductDto(Guid Id, int StockQuantity);
