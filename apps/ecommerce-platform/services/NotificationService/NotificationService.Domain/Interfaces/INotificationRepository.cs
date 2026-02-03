using NotificationService.Domain.Entities;

namespace NotificationService.Domain.Interfaces;

public interface INotificationRepository
{
    Task AddAsync(Notification notification, CancellationToken cancellationToken = default);
    Task UpdateAsync(Notification notification, CancellationToken cancellationToken = default);
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Notification>> GetPendingAsync(CancellationToken cancellationToken = default);
}
