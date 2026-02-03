namespace Shared.Contracts.Events;

/// <summary>
/// Event published when an order is placed
/// </summary>
public sealed record OrderPlacedEvent
{
    public required Guid OrderId { get; init; }
    public required Guid UserId { get; init; }
    public required decimal TotalAmount { get; init; }
    public required List<OrderItemEventDto> Items { get; init; }
    public required DateTime PlacedAt { get; init; }
}

public sealed record OrderItemEventDto(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice);
