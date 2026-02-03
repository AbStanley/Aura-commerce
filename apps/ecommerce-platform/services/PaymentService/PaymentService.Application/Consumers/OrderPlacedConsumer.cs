using MassTransit;
using Shared.Contracts.Events;
using PaymentService.Application.Features;
using MediatR;

namespace PaymentService.Application.Consumers;

public sealed class OrderPlacedConsumer(ISender sender) : IConsumer<OrderPlacedEvent>
{
    public async Task Consume(ConsumeContext<OrderPlacedEvent> context)
    {
        var message = context.Message;
        
        // Trigger ProcessPayment command internally
        // Note: In a real scenario, we might need payment method details. 
        // For this demo, we assume the user has a default method or we treat it as "Cash on Delivery" / "Invoice" initiation 
        // OR more likely, the OrderPlaced event should contain PaymentMethodId.
        // For simplicity, we'll process a default payment.
        
        var command = new ProcessPaymentCommand(
            message.OrderId,
            message.UserId,
            message.TotalAmount,
            "eur",
            "pm_card_visa"); // Default test card

        await sender.Send(command);
    }
}
