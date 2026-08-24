import { BaseService } from '@/core/services/BaseService';
import { CompanyRepository, companyRepository } from '../repositories/CompanyRepository';

export class CompanyService extends BaseService {
  constructor(private readonly repository: CompanyRepository = companyRepository) {
    super();
  }
  // Add domain logic here
}

export const companyService = new CompanyService();
