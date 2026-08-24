import { BaseService } from '@/core/services/BaseService';
import { OperationalTelemetryRepository, operationalTelemetryRepository } from '../repositories/OperationalTelemetryRepository';

export class OperationalTelemetryService extends BaseService {
  constructor(private readonly repository: OperationalTelemetryRepository = operationalTelemetryRepository) {
    super();
  }
  // Add domain logic here
}

export const operationalTelemetryService = new OperationalTelemetryService();
