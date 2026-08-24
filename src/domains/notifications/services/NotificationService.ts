import { BaseService } from '@/core/services/BaseService';
import { NotificationRepository, notificationRepository } from '../repositories/NotificationRepository';

export class NotificationService extends BaseService {
  constructor(private readonly repository: NotificationRepository = notificationRepository) {
    super();
  }
  // Add domain logic here
}

export const notificationService = new NotificationService();
