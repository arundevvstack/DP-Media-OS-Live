import { BaseService } from '@/core/services/BaseService';
import { MarketLeadRepository, marketLeadRepository } from '../repositories/MarketLeadRepository';

export class MarketLeadService extends BaseService {
  constructor(private readonly repository: MarketLeadRepository = marketLeadRepository) {
    super();
  }
  // Add domain logic here
}

export const marketLeadService = new MarketLeadService();
