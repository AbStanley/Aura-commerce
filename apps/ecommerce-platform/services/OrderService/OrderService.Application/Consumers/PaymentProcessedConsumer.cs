using MassTransit;
using Shared.Contracts.Events;
using OrderService.Domain.Interfaces;
using OrderService.Domain.Enums;

namespace OrderService.Application.Consumers;

public sealed class PaymentStatusConsumer(IOrderRepository orderRepository) 
    : IConsumer<PaymentProcessedEvent>,
      IConsumer<PaymentFailedEvent>
{
    public async Task Consume(ConsumeContext<PaymentProcessedEvent> context)
    {
        var message = context.Message;
        var order = await orderRepository.GetByIdAsync(message.OrderId);

        if (order == null) return;

        // Domain Rule: Pending -> Authorized -> Captured
        order.MarkPaymentAuthorized(message.TransactionId);
        order.MarkPaymentCaptured();
        order.Confirm();
        
        await orderRepository.UpdateAsync(order);
    }

    public async Task Consume(ConsumeContext<PaymentFailedEvent> context)
    {
        var message = context.Message;
        var order = await orderRepository.GetByIdAsync(message.OrderId);

        if (order == null) return;

        order.MarkPaymentFailed(message.Reason ?? "Payment Failed");
        order.Cancel();

        await orderRepository.UpdateAsync(order);
    }
}
