namespace OrderService.Domain.Events;

public sealed record OrderPlacedEvent(
    Guid OrderId,
    Guid UserId,
    decimal TotalAmount,
    List<OrderItemDto> Items)
{
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}

public sealed record OrderItemDto(
    Guid ProductId,
    int Quantity);
