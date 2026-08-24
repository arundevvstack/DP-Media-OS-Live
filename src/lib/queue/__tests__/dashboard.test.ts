import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutiveObservationDashboard } from '../observation/ExecutiveObservationDashboard';
import { ProductionEvidenceRepository } from '../observation/ProductionEvidenceRepository';
import { ProductionObservationManager } from '../observation/ProductionObservationManager';

describe('Phase 3G - Executive Observation Dashboard', () => {
  beforeEach(() => {
    ProductionEvidenceRepository.clear();
  });

  it('Generates a dashboard string containing exact burn in constraints and metrics', () => {
    ProductionObservationManager.configure({ minRuntimeHours: 0, minJobsProcessed: 0 }); // instant pass
    
    ProductionEvidenceRepository.recordJobExecution({
      jobId: 'j-1', queueName: 'ai', executionDurationMs: 15, retryCount: 0, completionStatus: 'SUCCESS', timestamp: 0, driftStatus: 'NONE'
    });

    const dashboard = ExecutiveObservationDashboard.generateDashboard();
    
    expect(dashboard).toContain('**Recommendation:** READY FOR DECOMMISSION');
    expect(dashboard).toContain('**Queue Reliability Score:** 100.0 / 100');
    expect(dashboard).toContain('**Exactly Once Score:** 100 / 100');
    expect(dashboard).toContain('SLA Compliance\n**Status:** PASSED');
  });
});
