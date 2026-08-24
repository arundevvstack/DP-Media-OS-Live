export type IncidentSeverity = 'INFO' | 'WARNING' | 'MAJOR' | 'CRITICAL' | 'BLOCKER';

export interface IncidentRecord {
  id: string;
  severity: IncidentSeverity;
  rootCause: string;
  affectedQueue: string;
  affectedWorker?: string;
  affectedTenant?: string;
  recoveryTimeMs?: number;
  rollbackTriggered: boolean;
  timestamp: number;
}

export class IncidentTracker {
  private static incidents: IncidentRecord[] = [];

  public static track(incident: Omit<IncidentRecord, 'id' | 'timestamp'>) {
    this.incidents.push({
      ...incident,
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    });
  }

  public static getIncidents(): IncidentRecord[] {
    return this.incidents;
  }

  public static clear() {
    this.incidents = [];
  }
}
