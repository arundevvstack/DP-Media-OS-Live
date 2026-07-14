import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService, DomainError, ErrorCode, TransactionExecutor } from '../../src/lib/transaction';
import { createTransactionContext } from '../../src/lib/transaction/TransactionContext';

describe('Phase 2B - Finance Transaction Isolation', () => {
  let mockPrisma: any;
  let transactionService: TransactionService;

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn(),
      invoice: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      bankAccount: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      cashFlowActivity: {
        create: vi.fn(),
      },
    };
    transactionService = new TransactionService(mockPrisma);
  });

  it('Successful payment executes atomically', async () => {
    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      return cb(mockPrisma);
    });
    mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1', company_id: 'c-1', payment_status: 'Unpaid', total: 100 });
    mockPrisma.bankAccount.findUnique.mockResolvedValue({ id: 'bank-1', company_id: 'c-1', balance: 500 });
    mockPrisma.invoice.update.mockResolvedValue({ id: 'inv-1', payment_status: 'Paid' });
    mockPrisma.cashFlowActivity.create.mockResolvedValue({ id: 'cf-1' });
    mockPrisma.bankAccount.update.mockResolvedValue({ id: 'bank-1', balance: 600 });

    const result = await transactionService.runInTransaction('corr-1', async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: 'inv-1', company_id: 'c-1' } });
      const bankAccount = await tx.bankAccount.findUnique({ where: { id: 'bank-1', company_id: 'c-1' } });
      await tx.invoice.update({ where: { id: 'inv-1' }, data: { payment_status: 'Paid' } });
      await tx.cashFlowActivity.create({ data: { company_id: 'c-1', bank_account_id: 'bank-1', type: 'IN', amount: invoice.total, description: 'Test', reference_id: invoice.id, category: 'Client Payment', date: new Date() } });
      await tx.bankAccount.update({ where: { id: 'bank-1' }, data: { balance: { increment: invoice.total } } });
      return true;
    });

    expect(result).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.invoice.update).toHaveBeenCalled();
    expect(mockPrisma.cashFlowActivity.create).toHaveBeenCalled();
    expect(mockPrisma.bankAccount.update).toHaveBeenCalled();
  });

  it('Rollback on payment failure (Invoice already paid)', async () => {
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1', company_id: 'c-1', payment_status: 'Paid', total: 100 });

    const promise = transactionService.runInTransaction('corr-1', async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: 'inv-1', company_id: 'c-1' } });
      if (invoice.payment_status === 'Paid') {
        throw new DomainError('Invoice is already paid', ErrorCode.CONFLICT);
      }
      return true;
    });

    await expect(promise).rejects.toThrow('Invoice is already paid');
    expect(mockPrisma.invoice.update).not.toHaveBeenCalled();
    expect(mockPrisma.cashFlowActivity.create).not.toHaveBeenCalled();
  });

  it('Rollback on ledger failure', async () => {
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1', company_id: 'c-1', payment_status: 'Unpaid', total: 100 });
    mockPrisma.bankAccount.findUnique.mockResolvedValue({ id: 'bank-1', company_id: 'c-1', balance: 500 });
    
    // Simulate failure during cashflow creation
    mockPrisma.cashFlowActivity.create.mockRejectedValue(new Error('Ledger write failed'));

    const promise = transactionService.runInTransaction('corr-1', async (tx) => {
      await tx.invoice.update({ where: { id: 'inv-1' }, data: { payment_status: 'Paid' } });
      await tx.cashFlowActivity.create({ data: { company_id: 'c-1', bank_account_id: 'bank-1', type: 'IN', amount: 100, description: 'Test', reference_id: 'inv-1', category: 'Client Payment', date: new Date() } });
      return true;
    });

    await expect(promise).rejects.toThrow('Transaction failed');
  });

  it('Retry on transient lock/deadlock failure', async () => {
    let attempt = 0;
    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      attempt++;
      if (attempt === 1) {
        throw { code: 'P2028', retryable: true }; // Deadlock
      }
      return cb(mockPrisma);
    });

    const result = await transactionService.runInTransaction('corr-retry', async (tx) => {
      return true;
    });

    expect(result).toBe(true);
    expect(attempt).toBe(2);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2);
  });
});
