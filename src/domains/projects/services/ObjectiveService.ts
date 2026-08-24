import { BaseService } from '@/core/services/BaseService';
import { ObjectiveRepository, objectiveRepository } from '../repositories/ObjectiveRepository';

export class ObjectiveService extends BaseService {
  constructor(private readonly repository: ObjectiveRepository = objectiveRepository) {
    super();
  }
  // Add domain logic here
}

export const objectiveService = new ObjectiveService();
