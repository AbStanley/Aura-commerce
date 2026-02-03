namespace Shared.Contracts.Events;

/// <summary>
/// Event published when inventory is reserved for an order
/// </summary>
public sealed record InventoryReservedEvent
{
   public required Guid OrderId { get; init; }
    public required List<InventoryItemDto> Items { get; init; }
    public required DateTime ReservedAt { get; init; }
}

public sealed record InventoryItemDto
{
    public required Guid ProductId { get; init; }
    public required int Quantity { get; init; }
}
