import { TrafficAnalyzer } from './TrafficAnalyzer';
import { QueueParityAuditor } from './QueueParityAuditor';
import { IncidentTracker } from './IncidentTracker';
import { ProductionEvidenceRepository } from './ProductionEvidenceRepository';

export interface SLARequirements {
  maxFailureRate: number; // 0.01 (1%)
  maxRetryRate: number; // 0.03 (3%)
  maxDlqRate: number; // 0.005 (0.5%)
  minRedisAvailability: number; // 0.999
  minParityScore: number; // 0.9999
}

export interface SLAValidationResult {
  passed: boolean;
  violations: string[];
}

export class OperationalSLAValidator {
  public static validate(requirements: SLARequirements): SLAValidationResult {
    const traffic = TrafficAnalyzer.analyze();
    const parity = QueueParityAuditor.audit();
    const incidents = IncidentTracker.getIncidents();
    const jobs = ProductionEvidenceRepository.getJobEvidence();

    const violations: string[] = [];

    // Exactly Once Violations = 0
    if (parity.sideEffectDriftEvents > 0) {
      violations.push(`Exactly Once Violation: ${parity.sideEffectDriftEvents} duplicate executions detected.`);
    }

    // Queue Drift = 0
    if (parity.missingJobs > 0) {
      violations.push(`Queue Drift: ${parity.missingJobs} missing jobs.`);
    }

    // Automatic Rollback Triggered = 0
    const rollbacks = incidents.filter(i => i.rollbackTriggered).length;
    if (rollbacks > 0) {
      violations.push(`Rollbacks Triggered: ${rollbacks} automatic rollbacks occurred.`);
    }

    // Customer Incidents = 0
    const customerIncidents = incidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'BLOCKER').length;
    if (customerIncidents > 0) {
      violations.push(`Customer Incidents: ${customerIncidents} critical incidents recorded.`);
    }

    // Rates
    const total = traffic.totalJobsProduced || 1;
    const failureRate = traffic.totalJobsFailed / total;
    const retryRate = traffic.totalJobsRetried / total;
    const dlqRate = traffic.totalDlq / total;

    if (failureRate > requirements.maxFailureRate) {
      violations.push(`Failure Rate: ${(failureRate * 100).toFixed(2)}% exceeds max ${(requirements.maxFailureRate * 100).toFixed(2)}%`);
    }
    if (retryRate > requirements.maxRetryRate) {
      violations.push(`Retry Rate: ${(retryRate * 100).toFixed(2)}% exceeds max ${(requirements.maxRetryRate * 100).toFixed(2)}%`);
    }
    if (dlqRate > requirements.maxDlqRate) {
      violations.push(`DLQ Rate: ${(dlqRate * 100).toFixed(2)}% exceeds max ${(requirements.maxDlqRate * 100).toFixed(2)}%`);
    }
    if (parity.overallParityScore < requirements.minParityScore) {
      violations.push(`Parity Score: ${(parity.overallParityScore * 100).toFixed(4)}% is below min ${(requirements.minParityScore * 100).toFixed(4)}%`);
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }
}
