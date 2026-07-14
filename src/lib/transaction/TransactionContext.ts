export interface TransactionContext {
  transactionId: string;
  correlationId: string;
  userId?: string;
  tenantId?: string;
  service?: string;
  domain?: string;
  startTime: number;
}

export function createTransactionContext(
  correlationId: string,
  overrides?: Partial<Omit<TransactionContext, 'transactionId' | 'correlationId' | 'startTime'>>
): TransactionContext {
  return {
    transactionId: crypto.randomUUID(),
    correlationId,
    startTime: Date.now(),
    ...overrides,
  };
}
