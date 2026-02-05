using MediatR;
using Shared.Common.Results;
using ProductCatalogService.Domain.Interfaces;
using System.Linq;

namespace ProductCatalogService.Application.Features.Products;

public sealed record GetProductsQuery(int Page = 1, int PageSize = 10, Guid? CategoryId = null) : IRequest<Result<PagedResult<ProductDto>>>;

public sealed record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);

public sealed class GetProductsHandler(
    IProductRepository productRepository,
    IInventoryRepository inventoryRepository) : IRequestHandler<GetProductsQuery, Result<PagedResult<ProductDto>>>
{
    public async Task<Result<PagedResult<ProductDto>>> Handle(
        GetProductsQuery request,
        CancellationToken cancellationToken)
    {
        // Fetch products - optionally filtered by category
        IEnumerable<Domain.Entities.Product> allProducts;
        
        if (request.CategoryId.HasValue)
        {
            allProducts = await productRepository.GetByCategoryAsync(request.CategoryId.Value, cancellationToken);
        }
        else
        {
            allProducts = await productRepository.GetAllAsync(cancellationToken);
        }
        var totalCount = allProducts.Count();
        
        var pagedProducts = allProducts
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize);

        var dtos = new List<ProductDto>();

        foreach (var product in pagedProducts)
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

        return Result<PagedResult<ProductDto>>.Success(
            new PagedResult<ProductDto>(dtos, totalCount, request.Page, request.PageSize));
    }
}
