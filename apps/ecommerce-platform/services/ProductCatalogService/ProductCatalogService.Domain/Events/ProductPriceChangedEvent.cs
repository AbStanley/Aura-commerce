namespace ProductCatalogService.Domain.Events;

/// <summary>
/// Domain event fired when product price changes
/// </summary>
public sealed record ProductPriceChangedEvent(
    Guid ProductId,
    decimal OldPrice,
    decimal NewPrice,
    DateTime ChangedAt);
