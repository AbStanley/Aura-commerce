using Shared.Domain.Entities;

namespace ShoppingCartService.Domain.Entities;

/// <summary>
/// Shopping cart aggregate root
/// </summary>
public sealed class ShoppingCart : BaseEntity
{
    public required Guid UserId { get; init; }
    public List<CartItem> Items { get; set; } = [];
    public decimal TotalAmount => Items.Sum(i => i.TotalPrice);
    public int TotalItems => Items.Sum(i => i.Quantity);

    public static ShoppingCart Create(Guid userId)
        => new() { UserId = userId };

    public void AddItem(CartItem item)
    {
        var existingItem = Items.FirstOrDefault(i => i.ProductId == item.ProductId);
        if (existingItem != null)
        {
            existingItem.Quantity += item.Quantity;
        }
        else
        {
            Items.Add(item);
        }
    }

    public void UpdateItemQuantity(Guid productId, int quantity)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
        {
            if (quantity <= 0)
                Items.Remove(item);
            else
                item.Quantity = quantity;
        }
    }

    public void RemoveItem(Guid productId)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
            Items.Remove(item);
    }

    public void Clear() => Items.Clear();
}
