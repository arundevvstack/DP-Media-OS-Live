import { Comment } from "../entities/engines/comment.entity";
import { EventBus } from "./event.bus";

export class UniversalCommunicationEngine {
  
  static async addComment(entityType: string, entityId: string, userId: string, content: string, mentions: string[] = []) {
    

    const comment: Partial<Comment> = {
      entity_type: entityType,
      entity_id: entityId,
      content,
      mentions,
    };

    // Store in DB

    // Fire Event
    await EventBus.publish({
      id: crypto.randomUUID(),
      tenant_id: "system", 
      topic: "comment.created",
      payload: { entity_type: entityType, entity_id: entityId, user_id: userId, mentions },
      source: "CommunicationEngine",
      created_at: new Date()
    });

    // If there are mentions, the NotificationEngine (if subscribed to comment.created) will automatically send a notification.
  }
}
