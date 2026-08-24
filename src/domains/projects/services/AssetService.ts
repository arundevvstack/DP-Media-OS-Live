import { BaseService } from '@/core/services/BaseService';
import { AssetRepository, assetRepository } from '../repositories/AssetRepository';

export class AssetService extends BaseService {
  constructor(private readonly repository: AssetRepository = assetRepository) {
    super();
  }
  // Add domain logic here
}

export const assetService = new AssetService();
