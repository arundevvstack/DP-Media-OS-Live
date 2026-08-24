import { BaseService } from '@/core/services/BaseService';
import { InfrastructureIncidentRepository, infrastructureIncidentRepository } from '../repositories/InfrastructureIncidentRepository';

export class InfrastructureIncidentService extends BaseService {
  constructor(private readonly repository: InfrastructureIncidentRepository = infrastructureIncidentRepository) {
    super();
  }
  // Add domain logic here
}

export const infrastructureIncidentService = new InfrastructureIncidentService();
