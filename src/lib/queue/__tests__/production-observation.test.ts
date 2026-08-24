import { describe, it, expect, beforeEach } from 'vitest';
import { ProductionObservationManager } from '../observation/ProductionObservationManager';
import { ProductionEvidenceRepository } from '../observation/ProductionEvidenceRepository';
import { IncidentTracker } from '../observation/IncidentTracker';

describe('Phase 3G - Production Observation Manager', () => {
  beforeEach(() => {
    ProductionEvidenceRepository.clear();
    IncidentTracker.clear();
  });

  it('Generates a full observation report and detects missing burn-in requirements', () => {
    ProductionObservationManager.configure({ minRuntimeHours: 72, minJobsProcessed: 1000 });
    
    // Inject mock evidence
    for(let i = 0; i < 500; i++) {
      ProductionEvidenceRepository.recordJobExecution({
        jobId: `j-${i}`,
        queueName: 'ai-jobs',
        executionDurationMs: 15,
        retryCount: 0,
        completionStatus: 'SUCCESS',
        timestamp: Date.now(),
        driftStatus: 'NONE'
      });
    }

    const report = ProductionObservationManager.generateReport();
    
    expect(report.burnInSatisfied).toBe(false);
    expect(report.burnInStatus).toContain('Runtime');
    expect(report.burnInStatus).toContain('Jobs 500 < 1000');
    expect(report.traffic.totalJobsProduced).toBe(500);
  });
});
