import { BaseService } from '@/core/services/BaseService';
import { AIOperationalMemoryRepository, aIOperationalMemoryRepository } from '../repositories/AIOperationalMemoryRepository';

export class AIOperationalMemoryService extends BaseService {
  constructor(private readonly repository: AIOperationalMemoryRepository = aIOperationalMemoryRepository) {
    super();
  }
  // Add domain logic here
}

export const aIOperationalMemoryService = new AIOperationalMemoryService();
