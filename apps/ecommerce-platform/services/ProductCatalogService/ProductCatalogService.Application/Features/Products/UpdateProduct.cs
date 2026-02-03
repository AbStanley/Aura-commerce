using FluentValidation;
using MediatR;
using Shared.Common.Results;
using ProductCatalogService.Domain.Interfaces;

namespace ProductCatalogService.Application.Features.Products;

public sealed record UpdateProductCommand(
    Guid ProductId,
    string Name,
    string Description,
    decimal Price) : IRequest<Result>;

public sealed class UpdateProductValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Price).GreaterThan(0);
    }
}

public sealed class UpdateProductHandler(
    IProductRepository productRepository) : IRequestHandler<UpdateProductCommand, Result>
{
    public async Task<Result> Handle(
        UpdateProductCommand request,
        CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product is null)
            return Result.Failure("Product not found");

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;

        await productRepository.UpdateAsync(product, cancellationToken);

        return Result.Success();
    }
}
