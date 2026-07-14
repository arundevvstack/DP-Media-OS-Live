import { PrismaClient } from '@prisma/client';
import { TransactionExecutor, TransactionOptions, PrismaTransactionClient } from './TransactionExecutor';
import { TransactionContext, createTransactionContext } from './TransactionContext';

export class TransactionService {
  private executor: TransactionExecutor;

  constructor(prisma: PrismaClient) {
    this.executor = new TransactionExecutor(prisma);
  }

  /**
   * Executes a transactional block of code ensuring ACID properties and retry safety.
   * 
   * @param correlationId Identifier to trace this transaction in logs.
   * @param operation The business logic to execute.
   * @param options Transaction tuning (timeout, retries).
   * @param metadata Additional metadata for the context.
   */
  async runInTransaction<T>(
    correlationId: string,
    operation: (tx: PrismaTransactionClient, context: TransactionContext) => Promise<T>,
    options?: TransactionOptions,
    metadata?: Record<string, any>
  ): Promise<T> {
    const context = createTransactionContext(correlationId, metadata);
    
    return this.executor.execute(
      context,
      (tx) => operation(tx, context),
      options
    );
  }
}
