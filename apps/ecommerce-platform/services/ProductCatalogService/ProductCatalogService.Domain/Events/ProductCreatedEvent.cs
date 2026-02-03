namespace ProductCatalogService.Domain.Events;

/// <summary>
/// Domain event fired when a product is created
/// </summary>
public sealed record ProductCreatedEvent(
    Guid ProductId,
    string Name,
    string Sku,
    decimal Price,
    DateTime CreatedAt);
