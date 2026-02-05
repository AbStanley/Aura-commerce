using MediatR;
using Shared.Common.Results;
using ProductCatalogService.Domain.Interfaces;

namespace ProductCatalogService.Application.Features.Products;

public sealed record GetProductQuery(Guid ProductId) : IRequest<Result<ProductDto>>;

public sealed record ProductDto(
    Guid Id,
    string Name,
    string Description,
    string Sku,
    decimal Price,
    Guid CategoryId,
    string? ImageUrl,
    bool IsActive,
    int StockQuantity,
    DateTime CreatedAt);

public sealed class GetProductHandler(
    IProductRepository productRepository,
    IInventoryRepository inventoryRepository) : IRequestHandler<GetProductQuery, Result<ProductDto>>
{
    public async Task<Result<ProductDto>> Handle(
        GetProductQuery request,
        CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product is null)
            return Result<ProductDto>.Failure("Product not found");

        var inventory = await inventoryRepository.GetByProductIdAsync(product.Id, cancellationToken);

        var dto = new ProductDto(
            product.Id,
            product.Name,
            product.Description,
            product.Sku,
            product.Price,
            product.CategoryId,
            product.ImageUrl,
            product.IsActive,
            inventory?.QuantityAvailable ?? 0,
            product.CreatedAt);

        return Result<ProductDto>.Success(dto);
    }
}
