using Shared.Infrastructure.Entities;

namespace ProductCatalogService.Domain.Entities;

/// <summary>
/// Product entity
/// </summary>
public sealed class Product : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Sku { get; set; }
    public required decimal Price { get; set; }
    public required Guid CategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public HashSet<string> Tags { get; set; } = [];

    public static Product Create(
        string name,
        string description,
        string sku,
        decimal price,
        Guid categoryId)
        => new()
        {
            Name = name,
            Description = description,
            Sku = sku,
            Price = price,
            CategoryId = categoryId
        };
}
