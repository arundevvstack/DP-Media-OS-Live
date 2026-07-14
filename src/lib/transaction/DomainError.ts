export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  DEADLOCK = 'DEADLOCK',
  SERIALIZATION_FAILURE = 'SERIALIZATION_FAILURE',
}

export class DomainError extends Error {
  public readonly code: ErrorCode;
  public readonly retryable: boolean;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: ErrorCode = ErrorCode.INTERNAL_ERROR, retryable = false, context?: Record<string, any>) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.retryable = retryable;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TransactionError extends DomainError {
  constructor(message: string, code: ErrorCode = ErrorCode.TRANSACTION_FAILED, retryable = false, context?: Record<string, any>) {
    super(message, code, retryable, context);
    this.name = 'TransactionError';
  }
}
