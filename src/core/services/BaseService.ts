import { DomainEvent } from '../events/DomainEvent';

export abstract class BaseService {
  /**
   * Dispatches a domain event. In a production setting, this could wire 
   * directly to EventBus / BullMQ.
   */
  protected async publishEvent(event: DomainEvent): Promise<void> {
    const { EventBus } = await import('@/lib/event-bus');
    // Using any for type compatibility with current EventBus
    await EventBus.emit(event.type as any, event.payload);
  }
}
