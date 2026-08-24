import { BaseService } from '@/core/services/BaseService';
import { ProductionAIJobRepository, productionAIJobRepository } from '../repositories/ProductionAIJobRepository';

export class ProductionAIJobService extends BaseService {
  constructor(private readonly repository: ProductionAIJobRepository = productionAIJobRepository) {
    super();
  }
  // Add domain logic here
}

export const productionAIJobService = new ProductionAIJobService();
