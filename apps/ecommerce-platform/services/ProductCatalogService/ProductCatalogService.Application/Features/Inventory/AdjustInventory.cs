using FluentValidation;
using MediatR;
using Shared.Common.Results;
using ProductCatalogService.Domain.Interfaces;

namespace ProductCatalogService.Application.Features.Inventory;

public sealed record AdjustInventoryCommand(
    Guid ProductId,
    int QuantityChange) : IRequest<Result>;

public sealed class AdjustInventoryValidator : AbstractValidator<AdjustInventoryCommand>
{
    public AdjustInventoryValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
    }
}

public sealed class AdjustInventoryHandler(
    IInventoryRepository inventoryRepository) : IRequestHandler<AdjustInventoryCommand, Result>
{
    public async Task<Result> Handle(
        AdjustInventoryCommand request,
        CancellationToken cancellationToken)
    {
        var inventory = await inventoryRepository.GetByProductIdAsync(
            request.ProductId,
            cancellationToken);

        if (inventory is null)
            return Result.Failure("Inventory not found for product");

        inventory.QuantityAvailable += request.QuantityChange;

        if (inventory.QuantityAvailable < 0)
            return Result.Failure("Insufficient inventory");

        await inventoryRepository.UpdateAsync(inventory, cancellationToken);

        return Result.Success();
    }
}
