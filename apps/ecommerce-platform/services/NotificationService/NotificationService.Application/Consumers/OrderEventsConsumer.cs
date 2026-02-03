using MassTransit;
using Shared.Contracts.Events;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Entities;
using MediatR;
using NotificationService.Application.Features;

namespace NotificationService.Application.Consumers;

public sealed class OrderEventsConsumer(ISender sender) 
    : IConsumer<OrderPlacedEvent>, 
      IConsumer<PaymentProcessedEvent>,
      IConsumer<PaymentFailedEvent>
{
    public async Task Consume(ConsumeContext<OrderPlacedEvent> context)
    {
        var message = context.Message;

        // Send Email Confirmation
        await sender.Send(new SendEmailCommand(
            message.UserId,
            "user@example.com", // In real app, we'd look up user email
            $"Order Confirmed: {message.OrderId}",
            $"Your order of {message.TotalAmount:C} has been placed successfully."));
    }

    public async Task Consume(ConsumeContext<PaymentProcessedEvent> context)
    {
        var message = context.Message;
        
        // Send Email Update (Success)
        await sender.Send(new SendEmailCommand(
            message.UserId,
            "user@example.com",
            $"Payment Successful for Order {message.OrderId}",
            $"Your payment of {message.Amount:C} was processed successfully. Transaction ID: {message.TransactionId}"));
    }

    public async Task Consume(ConsumeContext<PaymentFailedEvent> context)
    {
        var message = context.Message;

        // Send Email Update (Failure)
        await sender.Send(new SendEmailCommand(
            message.UserId,
            "user@example.com",
            $"Payment Failed for Order {message.OrderId}",
            $"Your payment failed. Reason: {message.Reason}"));
    }
}
