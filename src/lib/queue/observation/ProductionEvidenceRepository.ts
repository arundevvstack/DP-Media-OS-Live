export interface JobEvidence {
  jobId: string;
  queueName: string;
  correlationId?: string;
  idempotencyKey?: string;
  executionDurationMs: number;
  retryCount: number;
  completionStatus: 'SUCCESS' | 'FAILED' | 'DLQ';
  timestamp: number;
  driftStatus: 'NONE' | 'TIMING' | 'PAYLOAD' | 'SIDE_EFFECT' | 'MISSING';
}

export interface WorkerEvidence {
  workerId: string;
  cpuPercent: number;
  memoryMb: number;
  eventLoopDelayMs: number;
  crashCount: number;
  restartCount: number;
  timestamp: number;
}

export class ProductionEvidenceRepository {
  private static jobs: JobEvidence[] = [];
  private static workers: WorkerEvidence[] = [];

  public static recordJobExecution(evidence: JobEvidence) {
    this.jobs.push(evidence);
  }

  public static recordWorkerMetrics(evidence: WorkerEvidence) {
    this.workers.push(evidence);
  }

  public static getJobEvidence(): JobEvidence[] {
    return this.jobs;
  }

  public static getWorkerEvidence(): WorkerEvidence[] {
    return this.workers;
  }

  public static clear() {
    this.jobs = [];
    this.workers = [];
  }
}
