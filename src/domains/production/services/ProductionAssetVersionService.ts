import { BaseService } from '@/core/services/BaseService';
import { ProductionAssetVersionRepository, productionAssetVersionRepository } from '../repositories/ProductionAssetVersionRepository';

export class ProductionAssetVersionService extends BaseService {
  constructor(private readonly repository: ProductionAssetVersionRepository = productionAssetVersionRepository) {
    super();
  }
  // Add domain logic here
}

export const productionAssetVersionService = new ProductionAssetVersionService();
