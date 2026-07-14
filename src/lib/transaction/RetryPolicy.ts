export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryableErrorCodes: string[];
}

export const DEFAULT_RETRY_POLICY: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 2000,
  backoffFactor: 2,
  retryableErrorCodes: ['DEADLOCK', 'SERIALIZATION_FAILURE', 'P2034', 'P2028'], // Prisma specific transient errors
};

export class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    policy: RetryOptions = DEFAULT_RETRY_POLICY,
    onRetry?: (error: any, attempt: number, delay: number) => void
  ): Promise<T> {
    let attempt = 0;
    let delay = policy.initialDelayMs;

    while (true) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        if (attempt > policy.maxRetries || !this.isRetryable(error, policy)) {
          throw error;
        }

        if (onRetry) {
          onRetry(error, attempt, delay);
        }

        await this.sleep(delay);
        delay = Math.min(delay * policy.backoffFactor, policy.maxDelayMs);
      }
    }
  }

  private static isRetryable(error: any, policy: RetryOptions): boolean {
    if (error?.retryable === true) return true;
    if (error?.code && policy.retryableErrorCodes.includes(error.code)) return true;
    
    // Check for Prisma specific connection/timeout errors (P1008, P2024, etc)
    if (error?.code && typeof error.code === 'string' && error.code.startsWith('P1')) {
      return true;
    }
    
    return false;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
