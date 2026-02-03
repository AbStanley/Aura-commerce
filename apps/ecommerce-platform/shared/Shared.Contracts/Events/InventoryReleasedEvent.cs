namespace Shared.Contracts.Events;

/// <summary>
/// Event published when inventory reservation is released (order cancelled)
/// </summary>
public sealed record InventoryReleasedEvent
{
    public required Guid OrderId { get; init; }
    public required List<InventoryItemDto> Items { get; init; }
    public required DateTime ReleasedAt { get; init; }
}
