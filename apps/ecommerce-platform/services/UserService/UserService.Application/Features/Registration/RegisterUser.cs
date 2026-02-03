using FluentValidation;
using MediatR;
using Shared.Common.Results;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;
using UserService.Domain.ValueObjects;

namespace UserService.Application.Features.Registration;

public sealed record RegisterUserCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName) : IRequest<Result<Guid>>;

public sealed class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
    }
}

public sealed class RegisterUserHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher) : IRequestHandler<RegisterUserCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken)
    {
        var email = Email.Create(request.Email);
        if (email is null)
            return Result<Guid>.Failure("Invalid email format");

        var exists = await userRepository.ExistsByEmailAsync(email.Value, cancellationToken);
        if (exists)
            return Result<Guid>.Failure("Email already registered");

        var passwordHash = passwordHasher.HashPassword(request.Password);

        var user = User.Create(
            email.Value,
            passwordHash,
            request.FirstName,
            request.LastName);

        await userRepository.AddAsync(user, cancellationToken);

        return Result<Guid>.Success(user.Id);
    }
}
