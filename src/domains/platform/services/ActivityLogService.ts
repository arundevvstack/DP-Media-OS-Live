import { BaseService } from '@/core/services/BaseService';
import { ActivityLogRepository, activityLogRepository } from '../repositories/ActivityLogRepository';

export class ActivityLogService extends BaseService {
  constructor(private readonly repository: ActivityLogRepository = activityLogRepository) {
    super();
  }
  // Add domain logic here
}

export const activityLogService = new ActivityLogService();
