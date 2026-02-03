using FluentValidation;
using MediatR;
using Shared.Common.Results;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;

namespace UserService.Application.Features.Authentication;

public sealed record RefreshTokenCommand(string RefreshToken) : IRequest<Result<RefreshTokenResponse>>;

public sealed record RefreshTokenResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt);

public sealed class RefreshTokenValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public sealed class RefreshTokenHandler(
    IRefreshTokenRepository refreshTokenRepository,
    IUserRepository userRepository,
    ITokenService tokenService) : IRequestHandler<RefreshTokenCommand, Result<RefreshTokenResponse>>
{
    public async Task<Result<RefreshTokenResponse>> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        var refreshToken = await refreshTokenRepository.GetByTokenAsync(
            request.RefreshToken,
            cancellationToken);

        if (refreshToken is null || !refreshToken.IsActive)
            return Result<RefreshTokenResponse>.Failure("Invalid or expired refresh token");

        var user = await userRepository.GetByIdAsync(refreshToken.UserId, cancellationToken);
        if (user is null || !user.IsActive)
            return Result<RefreshTokenResponse>.Failure("User not found or inactive");

        refreshToken.IsRevoked = true;
        await refreshTokenRepository.UpdateAsync(refreshToken, cancellationToken);

        var accessToken = tokenService.GenerateAccessToken(user.Id, user.Email, user.Roles);
        var newRefreshTokenValue = tokenService.GenerateRefreshToken();
        var newRefreshToken = RefreshToken.Create(user.Id, newRefreshTokenValue);

        await refreshTokenRepository.AddAsync(newRefreshToken, cancellationToken);

        var response = new RefreshTokenResponse(
            accessToken,
            newRefreshTokenValue,
            newRefreshToken.ExpiresAt);

        return Result<RefreshTokenResponse>.Success(response);
    }
}
