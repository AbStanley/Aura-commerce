using Shared.Domain.Entities;

namespace ProductCatalogService.Domain.Entities;

/// <summary>
/// Inventory tracking for products
/// </summary>
public sealed class Inventory : BaseEntity
{
    public required Guid ProductId { get; init; }
    public required int QuantityAvailable { get; set; }
    public required int QuantityReserved { get; set; }
    public int QuantityOnHand => QuantityAvailable + QuantityReserved;
    public bool IsInStock => QuantityAvailable > 0;

    public static Inventory Create(Guid productId, int initialQuantity)
        => new()
        {
            ProductId = productId,
            QuantityAvailable = initialQuantity,
            QuantityReserved = 0
        };

    public bool Reserve(int quantity)
    {
        if (QuantityAvailable < quantity) return false;
        QuantityAvailable -= quantity;
        QuantityReserved += quantity;
        return true;
    }

    public void Release(int quantity)
    {
        QuantityReserved -= quantity;
        QuantityAvailable += quantity;
    }
}
