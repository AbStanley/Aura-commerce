using MediatR;
using Shared.Common.Results;
using UserService.Application.Features.Authentication;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.Authentication.LoginWithExternalProvider;

public sealed class LoginWithExternalProviderCommandHandler(
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    ITokenService tokenService)
    : IRequestHandler<LoginWithExternalProviderCommand, Result<LoginResponse>>
{
    public async Task<Result<LoginResponse>> Handle(LoginWithExternalProviderCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null)
        {
            user = User.CreateExternal(
                request.Email,
                request.Provider,
                request.ProviderKey,
                request.FirstName,
                request.LastName);

            await userRepository.AddAsync(user, cancellationToken);
        }
        else
        {
            bool isUpdated = false;
            if (string.IsNullOrEmpty(user.Provider))
            {
                user.Provider = request.Provider;
                user.ProviderKey = request.ProviderKey;
                isUpdated = true;
            }
            
            if (isUpdated)
            {
                await userRepository.UpdateAsync(user, cancellationToken);
            }
        }

        var accessToken = tokenService.GenerateAccessToken(user.Id, user.Email, user.Roles);
        var refreshTokenValue = tokenService.GenerateRefreshToken();
        var refreshToken = RefreshToken.Create(user.Id, refreshTokenValue);

        await refreshTokenRepository.AddAsync(refreshToken, cancellationToken);

        var response = new LoginResponse(accessToken, refreshTokenValue, refreshToken.ExpiresAt);
        return Result<LoginResponse>.Success(response);
    }
}
