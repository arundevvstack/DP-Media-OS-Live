import { BaseService } from '@/core/services/BaseService';
import { MarketOpportunityRepository, marketOpportunityRepository } from '../repositories/MarketOpportunityRepository';

export class MarketOpportunityService extends BaseService {
  constructor(private readonly repository: MarketOpportunityRepository = marketOpportunityRepository) {
    super();
  }
  // Add domain logic here
}

export const marketOpportunityService = new MarketOpportunityService();
