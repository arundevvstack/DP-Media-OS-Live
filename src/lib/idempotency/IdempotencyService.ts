import { IIdempotencyRepository } from './IdempotencyRepository';
import { IdempotencyValidator } from './IdempotencyValidator';
import { DomainError, ErrorCode } from '../transaction/DomainError';

export class IdempotencyService {
  constructor(private readonly repository: IIdempotencyRepository) {}

  /**
   * Begins an idempotent operation.
   * If the key already exists and is locked, throws CONFLICT.
   * If the key already exists and has a saved response, returns the saved response.
   * If the key does not exist, creates it and returns null (indicating operation should proceed).
   */
  async beginOperation(key: string, ttlSeconds: number = 86400): Promise<{ status: number, body: string } | null> {
    const validKey = IdempotencyValidator.validateKey(key);
    
    const existing = await this.repository.findByKey(validKey);
    
    if (existing) {
      if (existing.lockedAt) {
        throw new DomainError('Concurrent request with same idempotency key is currently processing', ErrorCode.CONFLICT);
      }
      return {
        status: existing.responseStatus,
        body: existing.responseBody,
      };
    }

    await this.repository.create(validKey, ttlSeconds);
    return null; // Proceed with operation
  }

  async finishOperation(key: string, status: number, body: string): Promise<void> {
    const validKey = IdempotencyValidator.validateKey(key);
    await this.repository.update(validKey, status, body);
  }

  async cleanupFailedOperation(key: string): Promise<void> {
    const validKey = IdempotencyValidator.validateKey(key);
    await this.repository.delete(validKey);
  }
}
