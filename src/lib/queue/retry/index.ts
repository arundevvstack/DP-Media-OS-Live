import { QueueConfig } from '../config';

export class RetryManager {
  /**
   * Evaluates if a given error should trigger an immediate retry, exponential backoff, or DLQ.
   */
  public static calculateBackoff(attemptsMade: number, error: Error): number {
    if (attemptsMade >= QueueConfig.MAX_RETRIES) {
      return -1; // -1 means do not retry, let it fail and route to DLQ
    }

    if (error.message.includes('Rate limit') || error.message.includes('429')) {
      return Math.pow(2, attemptsMade) * 5000; // 5s, 10s, 20s
    }

    if (error.message.includes('deadlock') || error.message.includes('SerializationFailure')) {
      return Math.random() * 500; // jittered immediate retry
    }

    return Math.pow(2, attemptsMade) * 1000; // standard exponential 1s, 2s, 4s
  }
}
