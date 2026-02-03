using FluentValidation;
using MediatR;
using Shared.Common.Results;
using ProductCatalogService.Domain.Entities;
using ProductCatalogService.Domain.Interfaces;

namespace ProductCatalogService.Application.Features.Products;

public sealed record CreateProductCommand(
    string Name,
    string Description,
    string Sku,
    decimal Price,
    Guid CategoryId,
    int InitialStock) : IRequest<Result<Guid>>;

public sealed class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.InitialStock).GreaterThanOrEqualTo(0);
    }
}

public sealed class CreateProductHandler(
    IProductRepository productRepository,
    IInventoryRepository inventoryRepository,
    ICategoryRepository categoryRepository) : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        CreateProductCommand request,
        CancellationToken cancellationToken)
    {
        var category = await categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
        if (category is null)
            return Result<Guid>.Failure("Category not found");

        var existingProduct = await productRepository.GetBySkuAsync(request.Sku, cancellationToken);
        if (existingProduct is not null)
            return Result<Guid>.Failure("Product with this SKU already exists");

        var product = Product.Create(
            request.Name,
            request.Description,
            request.Sku,
            request.Price,
            request.CategoryId);

        await productRepository.AddAsync(product, cancellationToken);

        var inventory = Inventory.Create(product.Id, request.InitialStock);
        await inventoryRepository.AddAsync(inventory, cancellationToken);

        return Result<Guid>.Success(product.Id);
    }
}
