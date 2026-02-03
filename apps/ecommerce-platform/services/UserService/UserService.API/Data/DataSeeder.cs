using UserService.Domain.Entities;
using UserService.Domain.Interfaces;
using UserService.Domain.ValueObjects;
using UserService.Application.Interfaces;

namespace UserService.API.Data;

public sealed class DataSeeder(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    ILogger<DataSeeder> logger)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var adminEmail = "admin@ecommerce.com";
        var email = Email.Create(adminEmail);
        
        if (email is null)
        {
            logger.LogError("Invalid admin email configured for seeding.");
            return;
        }

        var exists = await userRepository.ExistsByEmailAsync(adminEmail, cancellationToken);
        if (!exists)
        {
            logger.LogInformation("Seeding default Admin user: {Email}", adminEmail);
            
            var passwordHash = passwordHasher.HashPassword("AdminPass123!");
            var adminUser = User.Create(
                adminEmail,
                passwordHash,
                "System",
                "Admin");
            
            adminUser.Roles = ["Admin", "User"]; // Grant Admin role

            await userRepository.AddAsync(adminUser, cancellationToken);
            logger.LogInformation("Admin user seeded successfully.");
        }
        else
        {
            logger.LogInformation("Admin user already exists.");
        }
    }
}
