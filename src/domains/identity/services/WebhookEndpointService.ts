import { BaseService } from '@/core/services/BaseService';
import { WebhookEndpointRepository, webhookEndpointRepository } from '../repositories/WebhookEndpointRepository';

export class WebhookEndpointService extends BaseService {
  constructor(private readonly repository: WebhookEndpointRepository = webhookEndpointRepository) {
    super();
  }
  // Add domain logic here
}

export const webhookEndpointService = new WebhookEndpointService();
