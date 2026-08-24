import { BaseService } from '@/core/services/BaseService';
import { InvoiceRepository, invoiceRepository } from '../repositories/InvoiceRepository';

export class InvoiceService extends BaseService {
  constructor(private readonly repository: InvoiceRepository = invoiceRepository) {
    super();
  }
  // Add domain logic here
}

export const invoiceService = new InvoiceService();
