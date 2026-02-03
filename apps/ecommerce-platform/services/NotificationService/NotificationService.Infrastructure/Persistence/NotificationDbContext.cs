using Microsoft.EntityFrameworkCore;
using NotificationService.Domain.Entities;
using Shared.Infrastructure.Persistence;

namespace NotificationService.Infrastructure.Persistence;

public sealed class NotificationDbContext(DbContextOptions<NotificationDbContext> options) 
    : BaseDbContext(options)
{
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NotificationDbContext).Assembly);
    }
}
