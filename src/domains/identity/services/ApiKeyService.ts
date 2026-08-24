import { BaseService } from '@/core/services/BaseService';
import { ApiKeyRepository, apiKeyRepository } from '../repositories/ApiKeyRepository';

export class ApiKeyService extends BaseService {
  constructor(private readonly repository: ApiKeyRepository = apiKeyRepository) {
    super();
  }
  // Add domain logic here
}

export const apiKeyService = new ApiKeyService();
