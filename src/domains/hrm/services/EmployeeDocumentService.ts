import { BaseService } from '@/core/services/BaseService';
import { EmployeeDocumentRepository, employeeDocumentRepository } from '../repositories/EmployeeDocumentRepository';

export class EmployeeDocumentService extends BaseService {
  constructor(private readonly repository: EmployeeDocumentRepository = employeeDocumentRepository) {
    super();
  }
  // Add domain logic here
}

export const employeeDocumentService = new EmployeeDocumentService();
