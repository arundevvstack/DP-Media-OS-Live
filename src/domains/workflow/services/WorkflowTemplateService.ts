import { BaseService } from '@/core/services/BaseService';
import { WorkflowTemplateRepository, workflowTemplateRepository } from '../repositories/WorkflowTemplateRepository';

export class WorkflowTemplateService extends BaseService {
  constructor(private readonly repository: WorkflowTemplateRepository = workflowTemplateRepository) {
    super();
  }
  // Add domain logic here
}

export const workflowTemplateService = new WorkflowTemplateService();
