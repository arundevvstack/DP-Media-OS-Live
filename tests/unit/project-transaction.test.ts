import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService, DomainError, ErrorCode } from '../../src/lib/transaction';

describe('Phase 2E - Project & Production Transaction Isolation', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn(),
      project: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      objective: {
        findFirst: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
      },
      production: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      workflowState: {
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
      projectStage: {
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    };
  });

  it('Project creation rollback on duplicate name', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1', project_name: 'Alpha' });

    const promise = txService.runInTransaction('corr-1', async (tx) => {
      const existing = await tx.project.findFirst({ where: { project_name: 'Alpha' } });
      if (existing) {
        throw new DomainError('Project with name "Alpha" already exists', ErrorCode.CONFLICT);
      }
      return tx.project.create({ data: { project_name: 'Alpha' } });
    });

    await expect(promise).rejects.toThrow('Project with name "Alpha" already exists');
    expect(mockPrisma.project.create).not.toHaveBeenCalled();
  });

  it('Objective creation rollback on duplicate title in stage', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.objective.findFirst.mockResolvedValue({ id: 'obj-1', title: 'Setup Repo' });

    const promise = txService.runInTransaction('corr-2', async (tx) => {
      const existing = await tx.objective.findFirst({ where: { title: 'Setup Repo' } });
      if (existing) {
        throw new DomainError('Objective with title "Setup Repo" already exists in this stage', ErrorCode.CONFLICT);
      }
      return tx.objective.create({ data: { title: 'Setup Repo' } });
    });

    await expect(promise).rejects.toThrow('Objective with title "Setup Repo" already exists in this stage');
    expect(mockPrisma.objective.create).not.toHaveBeenCalled();
  });

  it('Production initialization rollback on duplicate name in project', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.production.findFirst.mockResolvedValue({ id: 'prod-1', name: 'Shoot Day 1' });

    const promise = txService.runInTransaction('corr-3', async (tx) => {
      const existing = await tx.production.findFirst({ where: { name: 'Shoot Day 1' } });
      if (existing) {
        throw new DomainError('Production "Shoot Day 1" already exists in this project', ErrorCode.CONFLICT);
      }
      return tx.production.create({ data: { name: 'Shoot Day 1' } });
    });

    await expect(promise).rejects.toThrow('Production "Shoot Day 1" already exists in this project');
    expect(mockPrisma.production.create).not.toHaveBeenCalled();
  });

  it('Stage transition prevents illegal transitions', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.workflowState.findUnique.mockResolvedValue({ active_stage_id: 'stage-1', is_blocked: false });
    mockPrisma.objective.findMany.mockResolvedValue([{ id: 'obj-1', status: 'Pending' }]);

    const promise = txService.runInTransaction('corr-4', async (tx) => {
      const state = await tx.workflowState.findUnique();
      const incomplete = await tx.objective.findMany();
      if (incomplete.length > 0) {
        throw new DomainError('Cannot transition stage. 1 objective(s) are incomplete in the current stage.', ErrorCode.VALIDATION);
      }
      return tx.workflowState.update({ data: { active_stage_id: 'stage-2' } });
    });

    await expect(promise).rejects.toThrow('Cannot transition stage. 1 objective(s) are incomplete in the current stage.');
    expect(mockPrisma.workflowState.update).not.toHaveBeenCalled();
  });
  
  it('Stage transition executes atomically on valid state', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.workflowState.findUnique.mockResolvedValue({ active_stage_id: 'stage-1', is_blocked: false });
    mockPrisma.objective.findMany.mockResolvedValue([]); // No incomplete objectives
    mockPrisma.workflowState.update.mockResolvedValue({ active_stage_id: 'stage-2' });

    const result = await txService.runInTransaction('corr-5', async (tx) => {
      const state = await tx.workflowState.findUnique();
      const incomplete = await tx.objective.findMany();
      if (incomplete.length > 0) {
        throw new DomainError('Cannot transition stage', ErrorCode.VALIDATION);
      }
      const updated = await tx.workflowState.update({ data: { active_stage_id: 'stage-2' } });
      await tx.projectStage.update({ where: { id: 'stage-1' }, data: { status: 'completed' } });
      await tx.auditLog.create({ data: { action: 'STAGE_TRANSITION' } });
      return updated;
    });

    expect(result.active_stage_id).toBe('stage-2');
    expect(mockPrisma.workflowState.update).toHaveBeenCalled();
    expect(mockPrisma.projectStage.update).toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });
});
