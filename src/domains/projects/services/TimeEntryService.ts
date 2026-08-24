import { BaseService } from '@/core/services/BaseService';
import { TimeEntryRepository, timeEntryRepository } from '../repositories/TimeEntryRepository';

export class TimeEntryService extends BaseService {
  constructor(private readonly repository: TimeEntryRepository = timeEntryRepository) {
    super();
  }
  // Add domain logic here
}

export const timeEntryService = new TimeEntryService();
