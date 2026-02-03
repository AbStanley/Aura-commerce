namespace OrderService.Domain.Events;

public sealed record OrderConfirmedEvent(
    Guid OrderId,
    string OrderNumber,
    Guid UserId)
{
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}
