import { Notification, NotificationPreference } from "../entities/engines/notification.entity";
import { EventBus } from "./event.bus";

export class UniversalNotificationEngine {
  
  static async send(notification: Partial<Notification>) {
    

    // In production:
    // 1. Fetch user preferences (NotificationPreference)
    // 2. Filter requested channels against muted channels
    // 3. If digest mode is ON and priority is not URGENT, queue for digest
    // 4. Otherwise, fan out to respective delivery providers (SendGrid, Twilio, Firebase FCM, Slack API)

    const finalChannels = notification.channels || ["IN_APP"];

    for (const channel of finalChannels) {
      
    }

    // Fire Event
    await EventBus.publish({
      id: crypto.randomUUID(),
      tenant_id: "system", // Should be passed through
      topic: "notification.sent",
      payload: { notification_id: "new_id", user_id: notification.user_id, channels: finalChannels },
      source: "NotificationEngine",
      created_at: new Date()
    });
  }
}
