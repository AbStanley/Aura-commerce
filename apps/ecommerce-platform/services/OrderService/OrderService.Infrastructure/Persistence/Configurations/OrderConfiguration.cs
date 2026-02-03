using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrderService.Domain.Entities;

namespace OrderService.Infrastructure.Persistence.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(o => o.OrderNumber).IsUnique();

        builder.Property(o => o.UserId).IsRequired();
        builder.HasIndex(o => o.UserId);

        builder.Property(o => o.Status).IsRequired();
        builder.Property(o => o.PaymentStatus).IsRequired();
        builder.Property(o => o.PaymentTransactionId).HasMaxLength(100);

        builder.OwnsOne(o => o.ShippingAddress, address =>
        {
            address.Property(a => a.Street).IsRequired().HasMaxLength(200);
            address.Property(a => a.City).IsRequired().HasMaxLength(100);
            address.Property(a => a.State).IsRequired().HasMaxLength(100);
            address.Property(a => a.PostalCode).IsRequired().HasMaxLength(20);
            address.Property(a => a.Country).IsRequired().HasMaxLength(100);
        });

        builder.HasMany(o => o.Items)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);
    }
}
