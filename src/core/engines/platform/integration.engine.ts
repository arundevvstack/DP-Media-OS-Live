import { z } from 'zod';
import { EventBus } from '../event.bus';
import { DomainEvent } from '../../entities/engines/event.entity';

export const IntegrationProviderSchema = z.enum([
  'GOOGLE_WORKSPACE', 'MICROSOFT_365', 'SLACK', 'WHATSAPP', 
  'STRIPE', 'QUICKBOOKS', 'XERO', 'SAP', 'CUSTOM_WEBHOOK'
]);

export const IntegrationConfigSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string(),
  provider: IntegrationProviderSchema,
  is_active: z.boolean().default(true),
  
  // Credentials (Should be encrypted in DB)
  api_key: z.string().optional(),
  oauth_token: z.string().optional(),
  webhook_url: z.string().url().optional(),
  
  // Mapping
  subscribed_events: z.array(z.string()), // E.g., ['hrms.employee.hired']
});

export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>;

export class IntegrationHubEngine {
  /**
   * Evaluates if any active integration configs are listening to a published DomainEvent
   * and dispatches them to external systems.
   */
  public static async dispatchEvent(event: DomainEvent, activeConfigs: IntegrationConfig[]) {
    const relevantConfigs = activeConfigs.filter(c => 
      c.is_active && 
      c.tenant_id === event.tenant_id && 
      c.subscribed_events.includes(event.topic)
    );

    for (const config of relevantConfigs) {
      try {
        await this.sendToProvider(config, event);
      } catch (error) {
        
        // In a real system, push to a Dead Letter Queue or Retry Queue here
      }
    }
  }

  private static async sendToProvider(config: IntegrationConfig, event: DomainEvent) {
    if (config.provider === 'CUSTOM_WEBHOOK' && config.webhook_url) {
      
      // await fetch(config.webhook_url, { method: 'POST', body: JSON.stringify(event) });
    } else if (config.provider === 'SLACK') {
      
    } else {
      
    }
  }
}
