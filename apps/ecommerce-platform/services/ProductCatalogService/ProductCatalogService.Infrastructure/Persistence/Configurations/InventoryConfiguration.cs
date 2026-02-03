using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProductCatalogService.Domain.Entities;

namespace ProductCatalogService.Infrastructure.Persistence.Configurations;

public sealed class InventoryConfiguration : IEntityTypeConfiguration<Inventory>
{
    public void Configure(EntityTypeBuilder<Inventory> builder)
    {
        builder.ToTable("Inventories");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductId)
            .IsRequired();

        builder.HasIndex(i => i.ProductId)
            .IsUnique();
    }
}
