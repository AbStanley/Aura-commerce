using Shared.Domain.Entities;

namespace OrderService.Domain.Entities;

public sealed class OrderItem : BaseEntity
{
    public required Guid ProductId { get; init; }
    public required string ProductName { get; set; }
    public required decimal UnitPrice { get; init; }
    public required int Quantity { get; init; }
    public decimal TotalPrice => UnitPrice * Quantity;

    public static OrderItem Create(Guid productId, string productName, decimal unitPrice, int quantity)
        => new()
        {
            ProductId = productId,
            ProductName = productName,
            UnitPrice = unitPrice,
            Quantity = quantity
        };
}
