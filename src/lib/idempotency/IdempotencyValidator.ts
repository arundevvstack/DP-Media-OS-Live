import { ErrorCode, DomainError } from '../transaction/DomainError';

export class IdempotencyValidator {
  static validateKey(key?: string | null): string {
    if (!key || typeof key !== 'string') {
      throw new DomainError('Idempotency key is missing or invalid', ErrorCode.VALIDATION_ERROR);
    }
    if (key.length > 255) {
      throw new DomainError('Idempotency key exceeds maximum length of 255 characters', ErrorCode.VALIDATION_ERROR);
    }
    return key;
  }
}
