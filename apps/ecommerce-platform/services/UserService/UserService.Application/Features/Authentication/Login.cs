using FluentValidation;
using MediatR;
using Shared.Common.Results;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;

namespace UserService.Application.Features.Authentication;

public sealed record LoginCommand(string Email, string Password) : IRequest<Result<LoginResponse>>;

public sealed record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt);

public sealed class LoginValidator : AbstractValidator<LoginCommand>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class LoginHandler(
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService) : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    public async Task<Result<LoginResponse>> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(
            request.Email.ToLowerInvariant(),
            cancellationToken);

        if (user is null || !passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            return Result<LoginResponse>.Failure("Invalid email or password");

        if (!user.IsActive)
            return Result<LoginResponse>.Failure("Account is inactive");

        var accessToken = tokenService.GenerateAccessToken(user.Id, user.Email, user.Roles);
        var refreshTokenValue = tokenService.GenerateRefreshToken();
        var refreshToken = RefreshToken.Create(user.Id, refreshTokenValue);

        await refreshTokenRepository.AddAsync(refreshToken, cancellationToken);

        var response = new LoginResponse(accessToken, refreshTokenValue, refreshToken.ExpiresAt);
        return Result<LoginResponse>.Success(response);
    }
}
