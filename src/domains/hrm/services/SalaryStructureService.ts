import { BaseService } from '@/core/services/BaseService';
import { SalaryStructureRepository, salaryStructureRepository } from '../repositories/SalaryStructureRepository';

export class SalaryStructureService extends BaseService {
  constructor(private readonly repository: SalaryStructureRepository = salaryStructureRepository) {
    super();
  }
  // Add domain logic here
}

export const salaryStructureService = new SalaryStructureService();
