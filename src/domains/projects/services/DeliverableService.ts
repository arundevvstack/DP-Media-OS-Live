import { BaseService } from '@/core/services/BaseService';
import { DeliverableRepository, deliverableRepository } from '../repositories/DeliverableRepository';

export class DeliverableService extends BaseService {
  constructor(private readonly repository: DeliverableRepository = deliverableRepository) {
    super();
  }
  // Add domain logic here
}

export const deliverableService = new DeliverableService();
