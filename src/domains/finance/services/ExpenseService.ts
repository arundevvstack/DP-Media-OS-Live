import { BaseService } from '@/core/services/BaseService';
import { ExpenseRepository, expenseRepository } from '../repositories/ExpenseRepository';

export class ExpenseService extends BaseService {
  constructor(private readonly repository: ExpenseRepository = expenseRepository) {
    super();
  }
  // Add domain logic here
}

export const expenseService = new ExpenseService();
