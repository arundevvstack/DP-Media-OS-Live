import { TrafficAnalyzer, TrafficMetrics } from './TrafficAnalyzer';
import { QueueParityAuditor, ParityAuditResult } from './QueueParityAuditor';
import { OperationalSLAValidator, SLAValidationResult } from './OperationalSLAValidator';
import { IncidentTracker, IncidentRecord } from './IncidentTracker';
import { RollbackHistoryAnalyzer, RollbackTimelineEvent } from './RollbackHistoryAnalyzer';

export interface BurnInRequirements {
  minRuntimeHours: number;
  minJobsProcessed: number;
}

export interface ObservationReport {
  runtimeHours: number;
  totalRealJobsProcessed: number;
  traffic: TrafficMetrics;
  parity: ParityAuditResult;
  sla: SLAValidationResult;
  incidents: IncidentRecord[];
  rollbacks: RollbackTimelineEvent[];
  burnInSatisfied: boolean;
  burnInStatus: string;
}

export class ProductionObservationManager {
  private static startTime = Date.now();
  private static burnInRequirements: BurnInRequirements = {
    minRuntimeHours: 72,
    minJobsProcessed: 1000000 // 1 Million Jobs
  };

  public static configure(requirements: Partial<BurnInRequirements>) {
    this.burnInRequirements = { ...this.burnInRequirements, ...requirements };
  }

  public static generateReport(): ObservationReport {
    const runtimeHours = (Date.now() - this.startTime) / (1000 * 60 * 60);
    const traffic = TrafficAnalyzer.analyze();
    const parity = QueueParityAuditor.audit();
    
    const sla = OperationalSLAValidator.validate({
      maxFailureRate: 0.01,
      maxRetryRate: 0.03,
      maxDlqRate: 0.005,
      minRedisAvailability: 0.999,
      minParityScore: 0.9999
    });

    const incidents = IncidentTracker.getIncidents();
    const rollbacks = RollbackHistoryAnalyzer.analyze();

    let burnInSatisfied = true;
    const missingDeps = [];

    if (runtimeHours < this.burnInRequirements.minRuntimeHours) {
      burnInSatisfied = false;
      missingDeps.push(`Runtime ${runtimeHours.toFixed(2)}h < ${this.burnInRequirements.minRuntimeHours}h`);
    }

    if (traffic.totalJobsProduced < this.burnInRequirements.minJobsProcessed) {
      burnInSatisfied = false;
      missingDeps.push(`Jobs ${traffic.totalJobsProduced} < ${this.burnInRequirements.minJobsProcessed}`);
    }

    if (!sla.passed) {
      burnInSatisfied = false;
      missingDeps.push('SLA Violations active');
    }

    return {
      runtimeHours,
      totalRealJobsProcessed: traffic.totalJobsProduced,
      traffic,
      parity,
      sla,
      incidents,
      rollbacks,
      burnInSatisfied,
      burnInStatus: burnInSatisfied ? 'BURN IN COMPLETE' : `BURN IN PROGRESS: ${missingDeps.join(', ')}`
    };
  }
}
