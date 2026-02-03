using Shared.Infrastructure.Entities;
using OrderService.Domain.Enums;
using OrderService.Domain.ValueObjects;

namespace OrderService.Domain.Entities;

/// <summary>
/// Order aggregate root with state machine
/// </summary>
public sealed class Order : BaseEntity
{
    public required Guid UserId { get; init; }
    public required string OrderNumber { get; init; }
    public List<OrderItem> Items { get; set; } = [];
    public required Address ShippingAddress { get; set; }
    public decimal TotalAmount => Items.Sum(i => i.TotalPrice);
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public PaymentStatus PaymentStatus { get; private set; } = PaymentStatus.Pending;
    public string? PaymentTransactionId { get; private set; }
    public DateTime? ShippedAt { get; private set; }
    public DateTime? DeliveredAt { get; private set; }

    public static Order Create(Guid userId, Address shippingAddress, List<OrderItem> items)
        => new()
        {
            UserId = userId,
            OrderNumber = GenerateOrderNumber(),
            ShippingAddress = shippingAddress,
            Items = items
        };

    public void Confirm()
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException($"Cannot confirm order in {Status} status");
        
        Status = OrderStatus.Confirmed;
    }

    public void StartProcessing()
    {
        if (Status != OrderStatus.Confirmed)
            throw new InvalidOperationException($"Cannot process order in {Status} status");
        
        Status = OrderStatus.Processing;
    }

    public void Ship()
    {
        if (Status != OrderStatus.Processing)
            throw new InvalidOperationException($"Cannot ship order in {Status} status");
        
        Status = OrderStatus.Shipped;
        ShippedAt = DateTime.UtcNow;
    }

    public void Deliver()
    {
        if (Status != OrderStatus.Shipped)
            throw new InvalidOperationException($"Cannot deliver order in {Status} status");
        
        Status = OrderStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status is OrderStatus.Shipped or OrderStatus.Delivered)
            throw new InvalidOperationException($"Cannot cancel order in {Status} status");
        
        Status = OrderStatus.Cancelled;
    }

    public void MarkPaymentAuthorized(string transactionId)
    {
        PaymentStatus = PaymentStatus.Authorized;
        PaymentTransactionId = transactionId;
    }

    public void MarkPaymentCaptured()
    {
        if (PaymentStatus != PaymentStatus.Authorized)
            throw new InvalidOperationException("Payment must be authorized before capture");
        
        PaymentStatus = PaymentStatus.Captured;
    }

    public void MarkPaymentFailed()
    {
        PaymentStatus = PaymentStatus.Failed;
        Status = OrderStatus.Failed;
    }

    private static string GenerateOrderNumber()
        => $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
}
