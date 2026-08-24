import { describe, it, expect, beforeEach } from 'vitest';
import { QueueParityAuditor } from '../observation/QueueParityAuditor';
import { ProductionEvidenceRepository } from '../observation/ProductionEvidenceRepository';

describe('Phase 3G - Queue Parity Auditor (Production)', () => {
  beforeEach(() => {
    ProductionEvidenceRepository.clear();
  });

  it('Detects exact drift from production evidence', () => {
    ProductionEvidenceRepository.recordJobExecution({
      jobId: `j-1`,
      queueName: 'ai-jobs',
      executionDurationMs: 15,
      retryCount: 0,
      completionStatus: 'SUCCESS',
      timestamp: Date.now(),
      driftStatus: 'SIDE_EFFECT'
    });

    ProductionEvidenceRepository.recordJobExecution({
      jobId: `j-2`,
      queueName: 'ai-jobs',
      executionDurationMs: 15,
      retryCount: 0,
      completionStatus: 'SUCCESS',
      timestamp: Date.now(),
      driftStatus: 'NONE'
    });

    const audit = QueueParityAuditor.audit();
    expect(audit.sideEffectDriftEvents).toBe(1);
    expect(audit.duplicateJobs).toBe(1);
    expect(audit.overallParityScore).toBe(0.5);
  });
});
