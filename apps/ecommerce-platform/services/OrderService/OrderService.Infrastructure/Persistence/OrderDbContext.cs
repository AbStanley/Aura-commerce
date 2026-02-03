using Microsoft.EntityFrameworkCore;
using OrderService.Domain.Entities;
using Shared.Infrastructure.Persistence;

namespace OrderService.Infrastructure.Persistence;

public sealed class OrderDbContext(DbContextOptions<OrderDbContext> options) 
    : BaseDbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderDbContext).Assembly);
    }
}
