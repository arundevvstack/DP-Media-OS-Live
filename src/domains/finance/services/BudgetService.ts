import { BaseService } from '@/core/services/BaseService';
import { BudgetRepository, budgetRepository } from '../repositories/BudgetRepository';

export class BudgetService extends BaseService {
  constructor(private readonly repository: BudgetRepository = budgetRepository) {
    super();
  }
  // Add domain logic here
}

export const budgetService = new BudgetService();
