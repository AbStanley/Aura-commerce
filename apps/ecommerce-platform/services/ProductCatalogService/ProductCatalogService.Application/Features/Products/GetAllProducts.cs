using MediatR;
using Shared.Common.Results;
using ProductCatalogService.Domain.Interfaces;

namespace ProductCatalogService.Application.Features.Products;

public sealed record GetAllProductsQuery : IRequest<Result<List<ProductDto>>>;

public sealed class GetAllProductsHandler(
    IProductRepository productRepository,
    IInventoryRepository inventoryRepository) : IRequestHandler<GetAllProductsQuery, Result<List<ProductDto>>>
{
    public async Task<Result<List<ProductDto>>> Handle(
        GetAllProductsQuery request,
        CancellationToken cancellationToken)
    {
        var products = await productRepository.GetAllAsync(cancellationToken);

        var dtos = new List<ProductDto>();

        foreach (var product in products)
        {
            var inventory = await inventoryRepository.GetByProductIdAsync(product.Id, cancellationToken);
            
            dtos.Add(new ProductDto(
                product.Id,
                product.Name,
                product.Description,
                product.Sku,
                product.Price,
                product.CategoryId,
                product.ImageUrl,
                product.IsActive,
                inventory?.QuantityAvailable ?? 0,
                product.CreatedAt));
        }

        return Result<List<ProductDto>>.Success(dtos);
    }
}
