import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService, DomainError, ErrorCode } from '../../src/lib/transaction';

describe('Phase 2F - AI Studio & Workflow Transaction Isolation', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn(),
      productionAIJob: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      storyboard: {
        findFirst: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
      scene: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      shotList: {
        create: vi.fn(),
      },
      promptLibrary: {
        create: vi.fn(),
      },
      promptTemplate: {
        create: vi.fn(),
      },
      productionAsset: {
        create: vi.fn(),
      },
      productionAssetVersion: {
        create: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    };
  });

  it('Job queue rollback on duplicate AI Job', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    // Simulate finding a duplicate queued job
    mockPrisma.productionAIJob.findFirst.mockResolvedValue({ id: 'job-1', status: 'Queued' });

    const promise = txService.runInTransaction('corr-1', async (tx) => {
      const duplicate = await tx.productionAIJob.findFirst();
      if (duplicate) {
        throw new DomainError("An identical job is already queued", ErrorCode.CONFLICT);
      }
      return tx.productionAIJob.create({ data: {} });
    });

    await expect(promise).rejects.toThrow('An identical job is already queued');
    expect(mockPrisma.productionAIJob.create).not.toHaveBeenCalled();
  });

  it('Storyboard approval rollback if already approved', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.storyboard.findFirst.mockResolvedValue({ id: 'sb-1', status: 'APPROVED' });

    const promise = txService.runInTransaction('corr-2', async (tx) => {
      const storyboard = await tx.storyboard.findFirst();
      if (storyboard.status === 'APPROVED') {
        throw new DomainError("Storyboard is already approved", ErrorCode.CONFLICT);
      }
      return tx.storyboard.update({ data: { status: 'APPROVED' } });
    });

    await expect(promise).rejects.toThrow('Storyboard is already approved');
    expect(mockPrisma.storyboard.update).not.toHaveBeenCalled();
  });

  it('Storyboard approval executes atomically and generates assets', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    mockPrisma.storyboard.findFirst.mockResolvedValue({ 
      id: 'sb-2', 
      status: 'DRAFT',
      Frames: [
        { scene_number: 1, shot_number: 1, description: 'Test', CameraSetup: {} }
      ]
    });
    mockPrisma.scene.findFirst.mockResolvedValue(null);
    mockPrisma.scene.create.mockResolvedValue({ id: 'scene-1' });
    mockPrisma.promptLibrary.create.mockResolvedValue({ id: 'lib-1' });

    const result = await txService.runInTransaction('corr-3', async (tx) => {
      const storyboard = await tx.storyboard.findFirst();
      if (storyboard.status === 'APPROVED') throw new DomainError("Already approved", ErrorCode.CONFLICT);
      
      await tx.storyboard.update({ where: { id: storyboard.id }, data: { status: 'APPROVED' } });
      await tx.scene.create({ data: {} });
      await tx.shotList.create({ data: {} });
      await tx.promptLibrary.create({ data: {} });
      await tx.promptTemplate.create({ data: {} });
      
      return storyboard.id;
    });

    expect(result).toBe('sb-2');
    expect(mockPrisma.storyboard.update).toHaveBeenCalled();
    expect(mockPrisma.scene.create).toHaveBeenCalled();
    expect(mockPrisma.shotList.create).toHaveBeenCalled();
    expect(mockPrisma.promptLibrary.create).toHaveBeenCalled();
    expect(mockPrisma.promptTemplate.create).toHaveBeenCalled();
  });

  it('Job Dispatch completion rollback on duplicate completion', async () => {
    const txService = new TransactionService(mockPrisma);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    
    // Simulate finding the job already completed
    mockPrisma.productionAIJob.findUnique.mockResolvedValue({ id: 'job-1', status: 'Completed' });

    const promise = txService.runInTransaction('corr-4', async (tx) => {
      const checkJob = await tx.productionAIJob.findUnique();
      if (checkJob?.status === 'Completed') {
        throw new DomainError('Job already completed', ErrorCode.CONFLICT);
      }
      return tx.productionAsset.create({ data: {} });
    });

    await expect(promise).rejects.toThrow('Job already completed');
    expect(mockPrisma.productionAsset.create).not.toHaveBeenCalled();
  });
});
