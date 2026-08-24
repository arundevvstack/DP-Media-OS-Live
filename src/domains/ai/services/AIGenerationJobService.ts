import { BaseService } from '@/core/services/BaseService';
import { AIGenerationJobRepository, aIGenerationJobRepository } from '../repositories/AIGenerationJobRepository';

export class AIGenerationJobService extends BaseService {
  constructor(private readonly repository: AIGenerationJobRepository = aIGenerationJobRepository) {
    super();
  }
  // Add domain logic here
}

export const aIGenerationJobService = new AIGenerationJobService();
