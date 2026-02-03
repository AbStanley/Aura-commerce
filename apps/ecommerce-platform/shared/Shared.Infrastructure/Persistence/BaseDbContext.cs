using Microsoft.EntityFrameworkCore;

namespace Shared.Infrastructure.Persistence;

/// <summary>
/// Base DbContext with audit field handling
/// </summary>
public abstract class BaseDbContext(DbContextOptions options) : DbContext(options)
{
    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State is EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity.GetType().GetProperty("UpdatedAt") is { } property)
            {
                property.SetValue(entry.Entity, DateTime.UtcNow);
            }
        }
    }
}
