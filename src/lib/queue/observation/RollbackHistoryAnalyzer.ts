import { IncidentTracker } from './IncidentTracker';

export interface RollbackTimelineEvent {
  timestamp: number;
  triggerEvent: string;
  queueAffected: string;
  recoveryDurationMs?: number;
}

export class RollbackHistoryAnalyzer {
  public static analyze(): RollbackTimelineEvent[] {
    const incidents = IncidentTracker.getIncidents();
    
    return incidents
      .filter(i => i.rollbackTriggered)
      .map(i => ({
        timestamp: i.timestamp,
        triggerEvent: `Rollback triggered by ${i.severity} incident: ${i.rootCause}`,
        queueAffected: i.affectedQueue,
        recoveryDurationMs: i.recoveryTimeMs
      }))
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first
  }
}
