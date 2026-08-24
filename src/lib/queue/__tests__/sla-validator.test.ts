import { describe, it, expect, beforeEach } from 'vitest';
import { OperationalSLAValidator } from '../observation/OperationalSLAValidator';
import { ProductionEvidenceRepository } from '../observation/ProductionEvidenceRepository';
import { IncidentTracker } from '../observation/IncidentTracker';

describe('Phase 3G - Operational SLA Validator', () => {
  beforeEach(() => {
    ProductionEvidenceRepository.clear();
    IncidentTracker.clear();
  });

  it('Fails SLA if failure rate exceeds threshold', () => {
    // 2 failed, 8 success = 20% failure rate
    for(let i = 0; i < 8; i++) {
      ProductionEvidenceRepository.recordJobExecution({
        jobId: `s-${i}`, queueName: 'q', executionDurationMs: 10, retryCount: 0, completionStatus: 'SUCCESS', timestamp: 0, driftStatus: 'NONE'
      });
    }
    for(let i = 0; i < 2; i++) {
      ProductionEvidenceRepository.recordJobExecution({
        jobId: `f-${i}`, queueName: 'q', executionDurationMs: 10, retryCount: 0, completionStatus: 'FAILED', timestamp: 0, driftStatus: 'NONE'
      });
    }

    const sla = OperationalSLAValidator.validate({
      maxFailureRate: 0.01,
      maxRetryRate: 0.03,
      maxDlqRate: 0.005,
      minRedisAvailability: 0.999,
      minParityScore: 0.9999
    });

    expect(sla.passed).toBe(false);
    expect(sla.violations[0]).toContain('Failure Rate: 20.00% exceeds max 1.00%');
  });

  it('Fails SLA if rollbacks were triggered', () => {
    ProductionEvidenceRepository.recordJobExecution({
      jobId: `s-1`, queueName: 'q', executionDurationMs: 10, retryCount: 0, completionStatus: 'SUCCESS', timestamp: 0, driftStatus: 'NONE'
    });
    
    IncidentTracker.track({
      severity: 'WARNING', rootCause: 'Latency', affectedQueue: 'q', rollbackTriggered: true
    });

    const sla = OperationalSLAValidator.validate({
      maxFailureRate: 0.50,
      maxRetryRate: 0.50,
      maxDlqRate: 0.50,
      minRedisAvailability: 0.9,
      minParityScore: 0.9
    });

    expect(sla.passed).toBe(false);
    expect(sla.violations[0]).toContain('Rollbacks Triggered: 1');
  });
});
