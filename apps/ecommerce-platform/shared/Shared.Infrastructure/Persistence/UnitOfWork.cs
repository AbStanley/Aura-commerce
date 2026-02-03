using Microsoft.EntityFrameworkCore;

namespace Shared.Infrastructure.Persistence;

/// <summary>
/// Unit of Work pattern implementation
/// </summary>
public sealed class UnitOfWork(DbContext context) : IDisposable
{
    private readonly DbContext _context = context;
    private bool _disposed;

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);

    public void Dispose()
    {
        if (!_disposed)
        {
            _context.Dispose();
            _disposed = true;
        }
        GC.SuppressFinalize(this);
    }
}
