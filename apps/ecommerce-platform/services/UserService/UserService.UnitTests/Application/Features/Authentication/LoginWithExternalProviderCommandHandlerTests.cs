using FluentAssertions;
using NSubstitute;
using Shared.Common.Results;
using UserService.Application.Features.Authentication.LoginWithExternalProvider;
using UserService.Application.Features.Authentication;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;
using Xunit;

namespace UserService.UnitTests.Application.Features.Authentication;

public class LoginWithExternalProviderCommandHandlerTests
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ITokenService _tokenService;
    private readonly LoginWithExternalProviderCommandHandler _handler;

    public LoginWithExternalProviderCommandHandlerTests()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _refreshTokenRepository = Substitute.For<IRefreshTokenRepository>();
        _tokenService = Substitute.For<ITokenService>();
        _handler = new LoginWithExternalProviderCommandHandler(_userRepository, _refreshTokenRepository, _tokenService);
    }

    [Fact]
    public async Task Handle_ShouldCreateNewUser_WhenUserDoesNotExist()
    {
        // Arrange
        var command = new LoginWithExternalProviderCommand("test@example.com", "Google", "123", "Test", "User");
        _userRepository.GetByEmailAsync(command.Email, Arg.Any<CancellationToken>()).Returns((User?)null);
        
        var accessToken = "access_token";
        var refreshTokenValue = "refresh_token";
        _tokenService.GenerateAccessToken(Arg.Any<Guid>(), command.Email, Arg.Any<List<string>>()).Returns(accessToken);
        _tokenService.GenerateRefreshToken().Returns(refreshTokenValue);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.AccessToken.Should().Be(accessToken);
        result.Value.RefreshToken.Should().Be(refreshTokenValue);

        await _userRepository.Received(1).AddAsync(Arg.Is<User>(u => 
            u.Email == command.Email && 
            u.Provider == command.Provider && 
            u.ProviderKey == command.ProviderKey &&
            u.PasswordHash == null), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldLinkProvider_WhenUserExistsWithoutProvider()
    {
        // Arrange
        var command = new LoginWithExternalProviderCommand("test@example.com", "Google", "123", "Test", "User");
        var existingUser = User.Create("test@example.com", "hash", "Test", "User");
        
        _userRepository.GetByEmailAsync(command.Email, Arg.Any<CancellationToken>()).Returns(existingUser);
        
        var accessToken = "access_token";
        var refreshTokenValue = "refresh_token";
        _tokenService.GenerateAccessToken(existingUser.Id, existingUser.Email, existingUser.Roles).Returns(accessToken);
        _tokenService.GenerateRefreshToken().Returns(refreshTokenValue);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        // Check that user was updated
        // Note: checking property change on the object returned by mock is tricky if NSubstitute doesn't track it, 
        // but since we return a real object, the handler modifies it.
        existingUser.Provider.Should().Be(command.Provider);
        existingUser.ProviderKey.Should().Be(command.ProviderKey);

        await _userRepository.Received(1).UpdateAsync(existingUser, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldGenerateAndSaveRefreshToken()
    {
        // Arrange
        var command = new LoginWithExternalProviderCommand("test@example.com", "Google", "123", "Test", "User");
        var existingUser = User.Create("test@example.com", "hash", "Test", "User");
        existingUser.Provider = "Google";
        existingUser.ProviderKey = "123";

        _userRepository.GetByEmailAsync(command.Email, Arg.Any<CancellationToken>()).Returns(existingUser);
        
        var refreshTokenValue = "refresh_token";
        _tokenService.GenerateRefreshToken().Returns(refreshTokenValue);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        await _refreshTokenRepository.Received(1).AddAsync(Arg.Is<RefreshToken>(rt => 
            rt.Token == refreshTokenValue && 
            rt.UserId == existingUser.Id), Arg.Any<CancellationToken>());
    }
}
