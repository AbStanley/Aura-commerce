using FluentValidation;
using MediatR;
using Shared.Common.Results;
using ProductCatalogService.Domain.Entities;
using ProductCatalogService.Domain.Interfaces;

namespace ProductCatalogService.Application.Features.Categories;

public sealed record CreateCategoryCommand(
    string Name,
    string Description,
    Guid? ParentCategoryId) : IRequest<Result<Guid>>;

public sealed class CreateCategoryValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
    }
}

public sealed class CreateCategoryHandler(
    ICategoryRepository categoryRepository) : IRequestHandler<CreateCategoryCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        CreateCategoryCommand request,
        CancellationToken cancellationToken)
    {
        if (request.ParentCategoryId.HasValue)
        {
            var parentCategory = await categoryRepository.GetByIdAsync(
                request.ParentCategoryId.Value,
                cancellationToken);

            if (parentCategory is null)
                return Result<Guid>.Failure("Parent category not found");
        }

        var category = Category.Create(
            request.Name,
            request.Description,
            request.ParentCategoryId);

        await categoryRepository.AddAsync(category, cancellationToken);

        return Result<Guid>.Success(category.Id);
    }
}
