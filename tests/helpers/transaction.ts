import { PrismaClient } from '@prisma/client';
import { TransactionService } from '../../src/lib/transaction';
import { IdempotencyService, InMemoryIdempotencyRepository } from '../../src/lib/idempotency';

export const createTestPrismaClient = () => {
  // In a real test environment, this might connect to a test DB or use a mock.
  // For the transaction tests, we can use a mock or the actual dev DB.
  return new PrismaClient();
};

export const createTestTransactionService = (prisma: PrismaClient) => {
  return new TransactionService(prisma);
};

export const createTestIdempotencyService = () => {
  const repo = new InMemoryIdempotencyRepository();
  return new IdempotencyService(repo);
};
