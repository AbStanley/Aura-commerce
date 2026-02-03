using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaymentService.Domain.Entities;

namespace PaymentService.Infrastructure.Persistence.Configurations;

public sealed class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.OrderId).IsRequired();
        builder.HasIndex(p => p.OrderId);

        builder.Property(p => p.UserId).IsRequired();
        builder.HasIndex(p => p.UserId);

        builder.Property(p => p.Amount).IsRequired().HasPrecision(18, 2);
        builder.Property(p => p.Currency).IsRequired().HasMaxLength(3);
        
        builder.Property(p => p.Status).IsRequired();
        
        builder.Property(p => p.TransactionId).HasMaxLength(100);
        builder.HasIndex(p => p.TransactionId); // Search by external ID
    }
}
