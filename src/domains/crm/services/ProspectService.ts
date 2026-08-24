import { BaseService } from '@/core/services/BaseService';
import { ProspectRepository, prospectRepository } from '../repositories/ProspectRepository';

export class ProspectService extends BaseService {
  constructor(private readonly repository: ProspectRepository = prospectRepository) {
    super();
  }
  // Add domain logic here
}

export const prospectService = new ProspectService();
