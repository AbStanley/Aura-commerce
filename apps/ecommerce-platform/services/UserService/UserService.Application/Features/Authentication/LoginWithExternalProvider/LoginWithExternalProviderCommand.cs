using MediatR;
using Shared.Common.Results;
using UserService.Application.Features.Authentication;

namespace UserService.Application.Features.Authentication.LoginWithExternalProvider;

public record LoginWithExternalProviderCommand(
    string Email,
    string Provider,
    string ProviderKey,
    string FirstName,
    string LastName) : IRequest<Result<LoginResponse>>;
