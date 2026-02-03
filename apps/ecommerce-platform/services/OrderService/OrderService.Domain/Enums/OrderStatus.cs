namespace OrderService.Domain.Enums;

/// <summary>
/// Order status state machine
/// </summary>
public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5,
    Failed = 6
}
