import { BaseService } from '@/core/services/BaseService';
import { ProductionShotRepository, productionShotRepository } from '../repositories/ProductionShotRepository';

export class ProductionShotService extends BaseService {
  constructor(private readonly repository: ProductionShotRepository = productionShotRepository) {
    super();
  }
  // Add domain logic here
}

export const productionShotService = new ProductionShotService();
