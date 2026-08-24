import { BaseService } from '@/core/services/BaseService';
import { ProjectRepository, projectRepository } from '../repositories/ProjectRepository';

export class ProjectService extends BaseService {
  constructor(private readonly repository: ProjectRepository = projectRepository) {
    super();
  }
  // Add domain logic here
}

export const projectService = new ProjectService();
