import { BaseService } from '@/core/services/BaseService';
import { EmployeeAttendanceRepository, employeeAttendanceRepository } from '../repositories/EmployeeAttendanceRepository';

export class EmployeeAttendanceService extends BaseService {
  constructor(private readonly repository: EmployeeAttendanceRepository = employeeAttendanceRepository) {
    super();
  }
  // Add domain logic here
}

export const employeeAttendanceService = new EmployeeAttendanceService();
