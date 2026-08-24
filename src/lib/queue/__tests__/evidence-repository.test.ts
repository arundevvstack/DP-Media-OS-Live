import { describe, it, expect, beforeEach } from 'vitest';
import { ProductionEvidenceRepository } from '../observation/ProductionEvidenceRepository';

describe('Phase 3G - Production Evidence Repository', () => {
  beforeEach(() => {
    ProductionEvidenceRepository.clear();
  });

  it('Records and retrieves Job Evidence', () => {
    ProductionEvidenceRepository.recordJobExecution({
      jobId: 'j-123',
      queueName: 'ai-jobs',
      executionDurationMs: 45,
      retryCount: 1,
      completionStatus: 'SUCCESS',
      timestamp: 1000,
      driftStatus: 'NONE'
    });

    const jobs = ProductionEvidenceRepository.getJobEvidence();
    expect(jobs.length).toBe(1);
    expect(jobs[0].jobId).toBe('j-123');
  });

  it('Records and retrieves Worker Evidence', () => {
    ProductionEvidenceRepository.recordWorkerMetrics({
      workerId: 'w-1',
      cpuPercent: 45.2,
      memoryMb: 1024,
      eventLoopDelayMs: 2.1,
      crashCount: 0,
      restartCount: 0,
      timestamp: 1000
    });

    const workers = ProductionEvidenceRepository.getWorkerEvidence();
    expect(workers.length).toBe(1);
    expect(workers[0].workerId).toBe('w-1');
  });
});
