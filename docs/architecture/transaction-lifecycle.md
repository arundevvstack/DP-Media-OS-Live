# Transaction Lifecycle & Architecture

## Overview
The Phase 2A transaction infrastructure replaces raw Prisma mutations scattered across the codebase with a unified, retry-safe, auditable `TransactionService`. 

## Flow
1. **Initiation**: A business domain layer (e.g. `BillingService`) injects `TransactionService` and calls `runInTransaction`.
2. **Context Creation**: `TransactionContext` is instantiated with a correlation ID.
3. **Execution**: `TransactionExecutor` wraps the logic in `prisma.$transaction`.
4. **Retry Logic**: If a transient database error occurs (e.g., `P2028` Deadlock, or `P2034` Serialization Failure), the `RetryPolicy` executes an exponential backoff.
5. **Observability**: Every state (start, retry, success, failure) is logged with `correlationId` using the structured `logger`.

## Idempotency
- Incoming mutating requests pass through the `IdempotencyMiddleware`.
- `IdempotencyService` locks the `idempotency-key`.
- On completion, the response payload is cached in `IdempotencyRepository`.
- Future requests with the same key immediately return the cached response, skipping transaction execution.

## Migration Guide
In Phase 2B, all API routes will be refactored to:
1. Extract business logic into Domain Services.
2. Inject `TransactionService` into Domain Services.
3. Convert direct `prisma.model.create()` calls to use the `tx` client provided by the transaction closure.
