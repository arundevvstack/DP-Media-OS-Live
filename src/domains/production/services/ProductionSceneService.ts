import { BaseService } from '@/core/services/BaseService';
import { ProductionSceneRepository, productionSceneRepository } from '../repositories/ProductionSceneRepository';

export class ProductionSceneService extends BaseService {
  constructor(private readonly repository: ProductionSceneRepository = productionSceneRepository) {
    super();
  }
  // Add domain logic here
}

export const productionSceneService = new ProductionSceneService();
