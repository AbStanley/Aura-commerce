using MediatR;
using Shared.Common.Results;
using ProductCatalogService.Domain.Interfaces;

namespace ProductCatalogService.Application.Features.Products;

public sealed record SearchProductsQuery(string SearchTerm) : IRequest<Result<List<ProductSearchDto>>>;

public sealed record ProductSearchDto(
    Guid Id,
    string Name,
    string Sku,
    decimal Price,
    bool IsInStock);

public sealed class SearchProductsHandler(
    IProductRepository productRepository,
    IInventoryRepository inventoryRepository) : IRequestHandler<SearchProductsQuery, Result<List<ProductSearchDto>>>
{
    public async Task<Result<List<ProductSearchDto>>> Handle(
        SearchProductsQuery request,
        CancellationToken cancellationToken)
    {
        var products = await productRepository.SearchAsync(request.SearchTerm, cancellationToken);

        var dtos = new List<ProductSearchDto>();

        foreach (var product in products)
        {
            var inventory = await inventoryRepository.GetByProductIdAsync(product.Id, cancellationToken);
            dtos.Add(new ProductSearchDto(
                product.Id,
                product.Name,
                product.Sku,
                product.Price,
                inventory?.IsInStock ?? false));
        }

        return Result<List<ProductSearchDto>>.Success(dtos);
    }
}
