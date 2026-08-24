import prisma from '@/lib/prisma';
import { EnterpriseQueueRouter } from '@/lib/queue/router/EnterpriseQueueRouter';
import { QueueName } from '@/lib/queue/registry';


export const notificationTemplates: Record<string, { title: string; body: string }> = {
  PROSPECT_CONVERTED: {
    title: 'Prospect Converted to Client',
    body: 'Great news! Prospect {{companyName}} has been successfully converted into an onboarded Client.'
  },
  APPROVAL_REQUESTED: {
    title: 'Approval Required',
    body: 'A new {{targetType}} requires your approval for step: {{step}}.'
  },
  APPROVAL_COMPLETED: {
    title: 'Approval Cycle Completed',
    body: 'The approval chain for {{targetType}} (ID: {{entityId}}) has been fully approved.'
  },
  SLA_WARNING: {
    title: 'SLA Escalation Warning',
    body: 'Task: "{{taskTitle}}" is approaching its SLA threshold and requires immediate attention.'
  }
};

export const notificationService = {
  /**
   * Queues a notification across user-preferred channels
   */
  async queueNotification({
    companyId,
    userId,
    templateKey,
    payload,
    priority = 'MEDIUM'
  }: {
    companyId: string;
    userId: string;
    templateKey: string;
    payload: Record<string, string>;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) {
    const template = notificationTemplates[templateKey];
    if (!template) {
      throw new Error(`Notification template key "${templateKey}" not found.`);
    }

    // 1. Interpolate payload variables in title and body
    let title = template.title;
    let body = template.body;
    for (const [key, val] of Object.entries(payload)) {
      title = title.replace(new RegExp(`{{${key}}}`, 'g'), val);
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), val);
    }

    // 2. Fetch User preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { user_id: userId }
    });

    let channels: string[] = ['IN_APP']; // default fallback channel

    if (preferences && typeof preferences.channels === 'object') {
      const channelMap = preferences.channels as Record<string, string[]>;
      if (Array.isArray(channelMap[templateKey])) {
        channels = channelMap[templateKey];
      } else if (Array.isArray(channelMap['default'])) {
        channels = channelMap['default'];
      }
    }

    const queuedEntries = [];

    // 3. Queue a record for each preferred channel
    for (const channel of channels) {
      const entry = await EnterpriseQueueRouter.dispatchPrimary(
        QueueName.NOTIFICATIONS,
        `send_notification_${channel.toLowerCase()}`,
        { companyId, userId, channel, title, body, priority }
      );
      queuedEntries.push(entry);
    }

    return queuedEntries;
  },

  /**
   * Channels dispatcher (Simulates SMTP, SMS, Slack webhooks)
   */
  async dispatch(item: { channel: string; user_id: string; company_id: string; title: string; body: string }) {
    switch (item.channel) {
      case 'IN_APP':
        // Write to core notification table
        await prisma.notification.create({
          data: {
            company_id: item.company_id,
            user_id: item.user_id,
            title: item.title,
            message: item.body,
            is_read: false
          }
        });
        break;

      case 'EMAIL':
        // Mock email transport agent
        console.log(`[EMAIL DISPATCH] To User ID ${item.user_id}: "${item.title}" - ${item.body}`);
        break;

      case 'SLACK':
        // Mock Slack webhook integration
        console.log(`[SLACK DISPATCH] Webhook notify: [${item.title}] ${item.body}`);
        break;

      case 'WHATSAPP':
        // Mock WhatsApp business API dispatcher
        console.log(`[WHATSAPP DISPATCH] Send message to user ${item.user_id}: ${item.body}`);
        break;

      default:
        throw new Error(`Unsupported channel dispatcher: ${item.channel}`);
    }
  },

  /**
   * Upsert a user's notification preferences
   */
  async savePreferences(userId: string, preferences: Record<string, string[]>) {
    return prisma.notificationPreference.upsert({
      where: { user_id: userId },
      update: {
        channels: preferences,
        updated_at: new Date()
      },
      create: {
        user_id: userId,
        channels: preferences,
        updated_at: new Date()
      }
    });
  }
};
