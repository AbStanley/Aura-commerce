using Microsoft.EntityFrameworkCore;
using Shared.Common.Pagination;
using Shared.Infrastructure.Entities;

namespace Shared.Infrastructure.Repositories;

/// <summary>
/// Generic repository base implementation
/// </summary>
public abstract class BaseRepository<TEntity>(DbContext context)
    where TEntity : BaseEntity
{
    protected readonly DbContext Context = context;
    protected readonly DbSet<TEntity> DbSet = context.Set<TEntity>();

    public virtual async Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await DbSet.FindAsync([id], cancellationToken);

    public virtual async Task<List<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
        => await DbSet.ToListAsync(cancellationToken);

    public virtual async Task<PagedList<TEntity>> GetPagedAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var totalCount = await DbSet.CountAsync(cancellationToken);
        var items = await DbSet
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedList<TEntity>(items, pageNumber, pageSize, totalCount);
    }

    public virtual async Task AddAsync(TEntity entity, CancellationToken cancellationToken = default)
        => await DbSet.AddAsync(entity, cancellationToken);

    public virtual void Update(TEntity entity)
        => DbSet.Update(entity);

    public virtual void Delete(TEntity entity)
        => DbSet.Remove(entity);
}
