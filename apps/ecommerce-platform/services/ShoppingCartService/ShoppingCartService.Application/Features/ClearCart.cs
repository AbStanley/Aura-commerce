using MediatR;
using Shared.Common.Results;
using ShoppingCartService.Domain.Interfaces;

namespace ShoppingCartService.Application.Features;

public sealed record ClearCartCommand(Guid UserId) : IRequest<Result>;

public sealed class ClearCartHandler(ICartRepository cartRepository) 
    : IRequestHandler<ClearCartCommand, Result>
{
    public async Task<Result> Handle(ClearCartCommand request, CancellationToken cancellationToken)
    {
        await cartRepository.DeleteAsync(request.UserId, cancellationToken);
        return Result.Success();
    }
}
