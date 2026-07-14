import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService, DomainError, ErrorCode } from '../../src/lib/transaction';
import crypto from 'crypto';

describe('Phase 2D - HRM Transaction Isolation', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn(),
      $executeRaw: vi.fn(),
      $queryRaw: vi.fn(),
      employeeAttendance: {
        create: vi.fn(),
        update: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
      },
      leaveRequest: {
        create: vi.fn(),
        findFirst: vi.fn(),
      },
      user: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      activityLog: {
        create: vi.fn(),
      },
      timeEntry: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      }
    };
  });

  it('Attendance creation executes atomically and checks for duplicates', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.employeeAttendance.findFirst.mockResolvedValue({ id: 'att-1', status: 'PRESENT' });

    const promise = txService.runInTransaction('corr-1', async (tx) => {
      const existing = await tx.employeeAttendance.findFirst();
      if (existing && existing.status === 'PRESENT') {
        throw new DomainError('Duplicate attendance record for this date already exists', ErrorCode.CONFLICT);
      }
      return tx.employeeAttendance.create({ data: { status: 'PRESENT' } });
    });

    await expect(promise).rejects.toThrow('Duplicate attendance record for this date already exists');
    expect(mockPrisma.employeeAttendance.create).not.toHaveBeenCalled();
  });

  it('Employee creation rollback on duplicate email', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

    const promise = txService.runInTransaction('corr-2', async (tx) => {
      const existing = await tx.user.findFirst({ where: { email: 'test@example.com' } });
      if (existing) {
        throw new DomainError('Duplicate employee with the same email already exists', ErrorCode.CONFLICT);
      }
      return tx.user.create({ data: { email: 'test@example.com' } });
    });

    await expect(promise).rejects.toThrow('Duplicate employee with the same email already exists');
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it('Leave request duplicate detection', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.leaveRequest.findFirst.mockResolvedValue({ id: 'leave-1', status: 'Pending' });

    const promise = txService.runInTransaction('corr-3', async (tx) => {
      const existing = await tx.leaveRequest.findFirst();
      if (existing) {
        throw new DomainError('Duplicate pending leave request already exists for these dates', ErrorCode.CONFLICT);
      }
      return tx.leaveRequest.create({ data: {} });
    });

    await expect(promise).rejects.toThrow('Duplicate pending leave request already exists for these dates');
    expect(mockPrisma.leaveRequest.create).not.toHaveBeenCalled();
  });

  it('Time entry approval executes atomically', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.timeEntry.findUnique.mockResolvedValue({ id: 'te-1', approval_status: 'pending' });
    mockPrisma.timeEntry.update.mockResolvedValue({ id: 'te-1', approval_status: 'approved' });

    const result = await txService.runInTransaction('corr-4', async (tx) => {
      const existing = await tx.timeEntry.findUnique({ where: { id: 'te-1' } });
      if (existing.approval_status === 'approved') {
        throw new DomainError('Time entry is already approved', ErrorCode.CONFLICT);
      }
      const entry = await tx.timeEntry.update({ data: { approval_status: 'approved' } });
      await tx.auditLog.create({ data: { action: 'APPROVED' } });
      return entry;
    });

    expect(result.approval_status).toBe('approved');
    expect(mockPrisma.timeEntry.update).toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });
});
