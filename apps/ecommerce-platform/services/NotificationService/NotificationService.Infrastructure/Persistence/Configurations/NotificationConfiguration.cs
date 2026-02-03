using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NotificationService.Domain.Entities;

namespace NotificationService.Infrastructure.Persistence.Configurations;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.UserId).IsRequired();
        builder.HasIndex(n => n.UserId);

        builder.Property(n => n.Type).IsRequired();
        builder.Property(n => n.Recipient).IsRequired().HasMaxLength(200);
        builder.Property(n => n.Subject).IsRequired().HasMaxLength(200);
        builder.Property(n => n.Body).IsRequired();
        
        builder.Property(n => n.Status).IsRequired();
        builder.Property(n => n.ExternalReferenceId).HasMaxLength(100);
    }
}
