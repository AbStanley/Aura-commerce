using MediatR;
using Shared.Common.Results;
using UserService.Domain.Interfaces;

namespace UserService.Application.Features.Profile;

public sealed record GetUserProfileQuery(Guid UserId) : IRequest<Result<UserProfileDto>>;

public sealed record UserProfileDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    List<string> Roles,
    DateTime CreatedAt);

public sealed class GetUserProfileHandler(
    IUserRepository userRepository) : IRequestHandler<GetUserProfileQuery, Result<UserProfileDto>>
{
    public async Task<Result<UserProfileDto>> Handle(
        GetUserProfileQuery request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);

        if (user is null)
            return Result<UserProfileDto>.Failure("User not found");

        var dto = new UserProfileDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Roles,
            user.CreatedAt);

        return Result<UserProfileDto>.Success(dto);
    }
}
