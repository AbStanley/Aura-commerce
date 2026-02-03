using FluentValidation;
using MediatR;
using Shared.Common.Results;
using UserService.Domain.Interfaces;

namespace UserService.Application.Features.Profile;

public sealed record UpdateUserProfileCommand(
    Guid UserId,
    string FirstName,
    string LastName) : IRequest<Result>;

public sealed class UpdateUserProfileValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
    }
}

public sealed class UpdateUserProfileHandler(
    IUserRepository userRepository) : IRequestHandler<UpdateUserProfileCommand, Result>
{
    public async Task<Result> Handle(
        UpdateUserProfileCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);

        if (user is null)
            return Result.Failure("User not found");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        await userRepository.UpdateAsync(user, cancellationToken);

        return Result.Success();
    }
}
