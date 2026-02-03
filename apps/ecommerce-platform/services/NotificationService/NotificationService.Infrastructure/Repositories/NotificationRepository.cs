using Microsoft.EntityFrameworkCore;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Enums;
using NotificationService.Domain.Interfaces;
using NotificationService.Infrastructure.Persistence;

namespace NotificationService.Infrastructure.Repositories;

public sealed class NotificationRepository(NotificationDbContext context) : INotificationRepository
{
    public async Task AddAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        await context.Notifications.AddAsync(notification, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        context.Notifications.Update(notification);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await context.Notifications.FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

    public async Task<List<Notification>> GetPendingAsync(CancellationToken cancellationToken = default)
        => await context.Notifications
            .Where(n => n.Status == NotificationStatus.Pending)
            .OrderBy(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
}
