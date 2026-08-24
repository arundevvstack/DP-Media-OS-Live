import { BaseService } from '@/core/services/BaseService';
import { ApprovalChainRepository, approvalChainRepository } from '../repositories/ApprovalChainRepository';

export class ApprovalChainService extends BaseService {
  constructor(private readonly repository: ApprovalChainRepository = approvalChainRepository) {
    super();
  }
  // Add domain logic here
}

export const approvalChainService = new ApprovalChainService();
