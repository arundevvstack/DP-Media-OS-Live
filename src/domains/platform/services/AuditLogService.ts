import { BaseService } from '@/core/services/BaseService';
import { AuditLogRepository, auditLogRepository } from '../repositories/AuditLogRepository';

export class AuditLogService extends BaseService {
  constructor(private readonly repository: AuditLogRepository = auditLogRepository) {
    super();
  }
  // Add domain logic here
}

export const auditLogService = new AuditLogService();
