import { logger } from '@/lib/observability/logger';

export interface ParityMismatch {
  field: string;
  legacyValue: any;
  shadowValue: any;
  reason: string;
}

export interface ParityReport {
  jobId: string;
  legacyJobId: string;
  queueName: string;
  matched: boolean;
  mismatches: ParityMismatch[];
  timingDifferenceMs: number;
  shadowExecutionTimeMs: number;
  legacyExecutionTimeMs: number;
  shadowStatus: 'completed' | 'failed' | 'timeout';
  legacyStatus: 'completed' | 'failed' | 'timeout';
}

export class MetricsCollector {
  public static recordParityReport(report: ParityReport) {
    if (report.matched) {
      logger.info('Shadow Execution Parity Matched', {
        eventType: 'QUEUE_PARITY_MATCH',
        jobId: report.jobId,
        legacyJobId: report.legacyJobId,
        queueName: report.queueName,
        timingDifferenceMs: report.timingDifferenceMs,
      });
    } else {
      logger.warn('Shadow Execution Parity Mismatch', {
        eventType: 'QUEUE_PARITY_MISMATCH',
        jobId: report.jobId,
        legacyJobId: report.legacyJobId,
        queueName: report.queueName,
        mismatches: report.mismatches,
        timingDifferenceMs: report.timingDifferenceMs,
      });
    }
  }

  public static recordSideEffectAttempted(jobId: string, action: string, data: any) {
    logger.error('Shadow Execution Side Effect Prevented', {
      eventType: 'QUEUE_SHADOW_SIDE_EFFECT_BLOCKED',
      jobId,
      action,
      data
    });
  }
}
