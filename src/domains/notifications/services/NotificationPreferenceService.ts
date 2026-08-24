import { BaseService } from '@/core/services/BaseService';
import { NotificationPreferenceRepository, notificationPreferenceRepository } from '../repositories/NotificationPreferenceRepository';

export class NotificationPreferenceService extends BaseService {
  constructor(private readonly repository: NotificationPreferenceRepository = notificationPreferenceRepository) {
    super();
  }
  // Add domain logic here
}

export const notificationPreferenceService = new NotificationPreferenceService();
