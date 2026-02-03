using Shared.Infrastructure.Entities;

namespace ShoppingCartService.Domain.Entities;

/// <summary>
/// Shopping cart item
/// </summary>
public sealed class CartItem : BaseEntity
{
    public required Guid ProductId { get; init; }
    public required string ProductName { get; set; }
    public required decimal UnitPrice { get; set; }
    public required int Quantity { get; set; }
    public decimal TotalPrice => UnitPrice * Quantity;

    public static CartItem Create(Guid productId, string productName, decimal unitPrice, int quantity)
        => new()
        {
            ProductId = productId,
            ProductName = productName,
            UnitPrice = unitPrice,
            Quantity = quantity
        };
}
