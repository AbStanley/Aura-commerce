using MediatR;
using Shared.Common.Results;
using ProductCatalogService.Domain.Interfaces;
using System.Linq;

namespace ProductCatalogService.Application.Features.Products;

public sealed record GetProductsQuery(int Page = 1, int PageSize = 10) : IRequest<Result<PagedResult<ProductDto>>>;

public sealed record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);

public sealed class GetProductsHandler(
    IProductRepository productRepository,
    IInventoryRepository inventoryRepository) : IRequestHandler<GetProductsQuery, Result<PagedResult<ProductDto>>>
{
    public async Task<Result<PagedResult<ProductDto>>> Handle(
        GetProductsQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Get raw query (we need IQueryable to pagination efficiently, but for now we modified Repo to return IEnumerable)
        // Ideally, Repository should return IQueryable or support pagination arguments.
        // Given I just added GetAllAsync returning IEnumerable, I will fetch all and paginate in memory 
        // OR better: Update Repo to support pagination.
        
        // Let's check repository again. I defined GetAllAsync.
        // It's better to add proper pagination to Repository or just accept the memory hit for "small-ish" catalog.
        // For a hackathon/showcase, I'll paginate in memory for simplicity unless I update Repo again.
        // WAIT, the plan said "Update Handler to use Skip and Take".
        
        // Let's update Repo to return IQueryable? No, that leaks infrastructure.
        // Let's modify GetAllAsync to GetPagedAsync(page, pageSize).

        // Actually, let's keep it simple. Fetch all and paginate here is fine for < 1000 items. 
        // BUT, the plan said "Update Handler to use Skip and Take". 

        var allProducts = await productRepository.GetAllAsync(cancellationToken);
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
