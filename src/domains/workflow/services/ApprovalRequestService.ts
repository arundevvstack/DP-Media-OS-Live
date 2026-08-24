import { BaseService } from '@/core/services/BaseService';
import { ApprovalRequestRepository, approvalRequestRepository } from '../repositories/ApprovalRequestRepository';

export class ApprovalRequestService extends BaseService {
  constructor(private readonly repository: ApprovalRequestRepository = approvalRequestRepository) {
    super();
  }
  // Add domain logic here
}

export const approvalRequestService = new ApprovalRequestService();
