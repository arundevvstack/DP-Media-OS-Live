import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionExecutor } from '../../src/lib/transaction';
import { createTransactionContext } from '../../src/lib/transaction/TransactionContext';

describe('TransactionExecutor', () => {
  it('should retry on transient errors based on policy', async () => {
    const mockPrisma = {
      $transaction: vi.fn()
        .mockRejectedValueOnce({ code: 'P2028', retryable: true })
        .mockResolvedValueOnce('success'),
    } as any;

    const executor = new TransactionExecutor(mockPrisma);
    const context = createTransactionContext('test-correlation-id');

    const result = await executor.execute(context, async () => 'op');
    expect(result).toBe('success');
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('should throw immediately on non-retryable errors', async () => {
    const mockPrisma = {
      $transaction: vi.fn()
        .mockRejectedValueOnce(new Error('Validation Failed')),
    } as any;

    const executor = new TransactionExecutor(mockPrisma);
    const context = createTransactionContext('test-correlation-id');

    await expect(executor.execute(context, async () => 'op')).rejects.toThrow('Transaction failed after retries');
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
