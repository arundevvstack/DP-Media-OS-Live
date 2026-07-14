import { PrismaClient } from '@prisma/client';
import { TransactionContext } from './TransactionContext';
import { RetryManager, RetryOptions, DEFAULT_RETRY_POLICY } from './RetryPolicy';
import { logger } from '../observability/logger';
import { TransactionError, ErrorCode } from './DomainError';

// Type alias for Prisma's transaction client
export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export interface TransactionOptions {
  timeoutMs?: number;
  maxWaitMs?: number;
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  retryPolicy?: RetryOptions;
}

export class TransactionExecutor {
  constructor(private readonly prisma: PrismaClient) {}

  async execute<T>(
    context: TransactionContext,
    operation: (tx: PrismaTransactionClient) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    const policy = options?.retryPolicy || DEFAULT_RETRY_POLICY;

    return RetryManager.withRetry(
      async () => {
        return await this.prisma.$transaction(
          async (tx) => {
            try {
              return await operation(tx as PrismaTransactionClient);
            } catch (error: any) {
              // Map prisma errors to Domain errors if necessary
              throw error;
            }
          },
          {
            maxWait: options?.maxWaitMs ?? 2000,
            timeout: options?.timeoutMs ?? 5000,
            isolationLevel: options?.isolationLevel,
          }
        );
      },
      policy,
      (error, attempt, delay) => {
        logger.warn(`Transaction retry triggered`, {
          ...context,
          attempt,
          delay,
          error: error?.message,
        }, error);
      }
    ).catch(error => {
      logger.error('Transaction completely failed', error, {
        ...context,
        durationMs: Date.now() - context.startTime,
      });
      if (error instanceof DomainError && !(error instanceof TransactionError)) {
        throw error;
      }
      throw new TransactionError('Transaction failed after retries', ErrorCode.TRANSACTION_FAILED, false, {
        originalError: error,
      });
    }).then(result => {
      logger.info('Transaction completed successfully', {
        ...context,
        durationMs: Date.now() - context.startTime,
      });
      return result;
    });
  }
}
