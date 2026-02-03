using Shared.Infrastructure.Entities;

namespace ProductCatalogService.Domain.Entities;

/// <summary>
/// Category entity for product organization
/// </summary>
public sealed class Category : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? ImageUrl { get; set; }
    public Guid? ParentCategoryId { get; set; }
    public bool IsActive { get; set; } = true;

    public static Category Create(string name, string description, Guid? parentId = null)
        => new()
        {
            Name = name,
            Description = description,
            ParentCategoryId = parentId
        };
}
