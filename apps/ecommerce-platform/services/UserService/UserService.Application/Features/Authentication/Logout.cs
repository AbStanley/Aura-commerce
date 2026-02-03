using MediatR;
using Shared.Common.Results;
using UserService.Domain.Interfaces;

namespace UserService.Application.Features.Authentication;

public sealed record LogoutCommand(Guid UserId) : IRequest<Result>;

public sealed class LogoutHandler(
    IRefreshTokenRepository refreshTokenRepository) : IRequestHandler<LogoutCommand, Result>
{
    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        await refreshTokenRepository.RevokeAllForUserAsync(request.UserId, cancellationToken);
        return Result.Success();
    }
}
