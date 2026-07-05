import { DomainEvent } from "../entities/engines/event.entity";

type EventHandler = (event: DomainEvent) => Promise<void>;

/**
 * Enterprise Event Bus
 * Decouples modules. Instead of CRM calling Projects, CRM fires 'client.created',
 * and the Projects module listens to that event to automatically provision a project board.
 */
export class EventBus {
  private static handlers: Map<string, EventHandler[]> = new Map();

  static subscribe(topic: string, handler: EventHandler) {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, []);
    }
    this.handlers.get(topic)!.push(handler);
  }

  static async publish(event: DomainEvent) {
    // 1. Log event to database for audit and replay (Dead Letter Queue capability)
    

    // 2. Execute all subscribed handlers asynchronously
    const topicHandlers = this.handlers.get(event.topic) || [];
    
    // In production, this would be pushed to a Redis Queue or Google Cloud Pub/Sub
    // For now, we execute them concurrently in memory.
    Promise.allSettled(topicHandlers.map(handler => handler(event)))
      .then(results => {
        results.forEach((result, i) => {
          if (result.status === "rejected") {
            
            // Push to Dead Letter Queue for retry
          }
        });
      });
  }
}
