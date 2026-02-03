namespace Shared.Contracts.Interfaces;

/// <summary>
/// Interface for publishing domain events to the message bus
/// </summary>
public interface IEventPublisher
{
    Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class;
}
