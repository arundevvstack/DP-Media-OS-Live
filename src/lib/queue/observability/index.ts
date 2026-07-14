import { logger } from '@/lib/observability/logger';

export interface QueueJobMetrics {
  correlationId: string;
  jobId: string;
  queueName: string;
  tenantId?: string;
  userId?: string;
  retries: number;
  durationMs: number;
  queueWaitMs: number;
  processingTimeMs: number;
  failureReason?: string;
  dlqStatus?: boolean;
}

export class QueueObservability {
  static logJobCompletion(metrics: QueueJobMetrics) {
    logger.info('Queue Job Completed', { ...metrics, eventType: 'QUEUE_JOB_COMPLETED' });
  }

  static logJobFailure(metrics: QueueJobMetrics) {
    logger.error('Queue Job Failed', { ...metrics, eventType: 'QUEUE_JOB_FAILED' });
  }

  static logDeadLetterRouting(metrics: QueueJobMetrics) {
    logger.warn('Job Routed to DLQ', { ...metrics, eventType: 'QUEUE_JOB_DLQ' });
  }

  static logShadowModeDispatched(queueName: string, jobId: string) {
    logger.info(`Shadow mode job dispatched to ${queueName}`, { jobId, eventType: 'QUEUE_JOB_SHADOW_DISPATCH' });
  }
}
