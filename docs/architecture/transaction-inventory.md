# Enterprise Transaction Inventory (Phase 2A)

This document contains the repository assessment mapping all non-transactional Prisma mutations prior to the Phase 2B migration.

## Inventory Summary

| Pattern | Count | Target State (Phase 2B) |
| --- | --- | --- |
| `prisma.*.create` | > 100 | `TransactionExecutor.execute` |
| `prisma.*.update` | > 50 | `TransactionExecutor.execute` |
| `prisma.*.delete` | > 20 | `TransactionExecutor.execute` |
| `prisma.*.upsert` | > 10 | `TransactionExecutor.execute` |
| `prisma.*.createMany` | > 5 | `TransactionExecutor.execute` |
| `prisma.$transaction` | < 5 | Unified `TransactionService` |

## Mapped Domains

The following domains currently execute direct mutations:
- `workflow.service.ts`
- `prospect.service.ts`
- `notification.service.ts`
- `client.service.ts`
- `audit.service.ts`
- `approval.service.ts`
- `various seed scripts`
- `various API routes (app/api/...)`

*Note: As per ERP-04, these will be progressively migrated to the Service Layer using the new `TransactionService` in Phase 2B. None of these existing calls are modified in Phase 2A.*
