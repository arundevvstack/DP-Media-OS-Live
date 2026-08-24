import { BaseService } from '@/core/services/BaseService';
import { BankAccountRepository, bankAccountRepository } from '../repositories/BankAccountRepository';

export class BankAccountService extends BaseService {
  constructor(private readonly repository: BankAccountRepository = bankAccountRepository) {
    super();
  }
  // Add domain logic here
}

export const bankAccountService = new BankAccountService();
