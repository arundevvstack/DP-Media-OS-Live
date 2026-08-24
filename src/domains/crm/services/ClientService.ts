import { BaseService } from '@/core/services/BaseService';
import { ClientRepository, clientRepository } from '../repositories/ClientRepository';

export class ClientService extends BaseService {
  constructor(private readonly repository: ClientRepository = clientRepository) {
    super();
  }
  // Add domain logic here
}

export const clientService = new ClientService();
