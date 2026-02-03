namespace Shared.Contracts.Events;

/// <summary>
/// Event published when an order is placed
/// </summary>
public sealed record OrderPlacedEvent
{
    public required Guid OrderId { get; init; }
    public required Guid UserId { get; init; }
    public required decimal TotalAmount { get; init; }
    public required List<OrderItemDto> Items { get; init; }
    public required DateTime PlacedAt { get; init; }
}

public sealed record OrderItemDto
{
    public required Guid ProductId { get; init; }
    public required string ProductName { get; init; }
    public required int Quantity { get; init; }
    public required decimal Price { get; init; }
}
