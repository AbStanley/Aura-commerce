using MediatR;
using Shared.Common.Results;
using ProductCatalogService.Domain.Interfaces;

namespace ProductCatalogService.Application.Features.Categories;

public sealed record GetAllCategoriesQuery : IRequest<Result<List<CategoryDto>>>;

public sealed record CategoryDto(
    Guid Id,
    string Name,
    string Description,
    Guid? ParentCategoryId);

public sealed class GetAllCategoriesHandler(
    ICategoryRepository categoryRepository) : IRequestHandler<GetAllCategoriesQuery, Result<List<CategoryDto>>>
{
    public async Task<Result<List<CategoryDto>>> Handle(
        GetAllCategoriesQuery request,
        CancellationToken cancellationToken)
    {
        var categories = await categoryRepository.GetAllAsync(cancellationToken);

        var dtos = categories.Select(c => new CategoryDto(
            c.Id,
            c.Name,
            c.Description,
            c.ParentCategoryId)).ToList();

        return Result<List<CategoryDto>>.Success(dtos);
    }
}
