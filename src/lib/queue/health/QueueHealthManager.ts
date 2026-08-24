import { QueueName } from '../registry';
import { QueueConfig } from '../config';
import { logger } from '../../observability/logger';

export interface QueueMetrics {
  totalProcessed: number;
  failures: number;
  retries: number;
  dlq: number;
  totalLatencyMs: number;
  totalProcessingTimeMs: number;
  workerRestarts: number;
}

export class QueueHealthManager {
  private static metrics: Map<QueueName, QueueMetrics> = new Map();

  private static getMetrics(queueName: QueueName): QueueMetrics {
    if (!this.metrics.has(queueName)) {
      this.metrics.set(queueName, {
        totalProcessed: 0,
        failures: 0,
        retries: 0,
        dlq: 0,
        totalLatencyMs: 0,
        totalProcessingTimeMs: 0,
        workerRestarts: 0
      });
    }
    return this.metrics.get(queueName)!;
  }

  public static recordJobSuccess(queueName: QueueName, latencyMs: number, processingTimeMs: number) {
    const metrics = this.getMetrics(queueName);
    metrics.totalProcessed++;
    metrics.totalLatencyMs += latencyMs;
    metrics.totalProcessingTimeMs += processingTimeMs;
    this.evaluateHealth(queueName);
  }

  public static recordJobFailure(queueName: QueueName, retries: number, isDlq: boolean) {
    const metrics = this.getMetrics(queueName);
    metrics.totalProcessed++;
    metrics.failures++;
    metrics.retries += retries;
    if (isDlq) {
      metrics.dlq++;
    }
    this.evaluateHealth(queueName);
  }

  public static recordWorkerRestart(queueName: QueueName) {
    const metrics = this.getMetrics(queueName);
    metrics.workerRestarts++;
    this.evaluateHealth(queueName);
  }

  private static evaluateHealth(queueName: QueueName) {
    const metrics = this.getMetrics(queueName);
    
    // Require minimum sample size to avoid noisy flip-flops
    if (metrics.totalProcessed < 10 && metrics.workerRestarts === 0) return;

    const failureRate = metrics.failures / metrics.totalProcessed;
    const retryRate = metrics.retries / metrics.totalProcessed;
    const dlqRate = metrics.dlq / metrics.totalProcessed;
    const avgLatency = metrics.totalLatencyMs / metrics.totalProcessed;
    const avgProcessingTime = metrics.totalProcessingTimeMs / metrics.totalProcessed;

    const issues: string[] = [];

    if (failureRate > QueueConfig.HEALTH_MAX_FAILURE_RATE) issues.push(`Failure rate ${failureRate.toFixed(2)} exceeds max ${QueueConfig.HEALTH_MAX_FAILURE_RATE}`);
    if (retryRate > QueueConfig.HEALTH_MAX_RETRY_RATE) issues.push(`Retry rate ${retryRate.toFixed(2)} exceeds max ${QueueConfig.HEALTH_MAX_RETRY_RATE}`);
    if (dlqRate > QueueConfig.HEALTH_MAX_DLQ_RATE) issues.push(`DLQ rate ${dlqRate.toFixed(2)} exceeds max ${QueueConfig.HEALTH_MAX_DLQ_RATE}`);
    if (avgLatency > QueueConfig.HEALTH_MAX_QUEUE_DELAY_MS) issues.push(`Latency ${avgLatency.toFixed(0)}ms exceeds max ${QueueConfig.HEALTH_MAX_QUEUE_DELAY_MS}ms`);
    if (avgProcessingTime > QueueConfig.HEALTH_MAX_PROCESSING_TIME_MS) issues.push(`Processing time ${avgProcessingTime.toFixed(0)}ms exceeds max ${QueueConfig.HEALTH_MAX_PROCESSING_TIME_MS}ms`);
    if (metrics.workerRestarts > QueueConfig.HEALTH_MAX_WORKER_RESTARTS) issues.push(`Worker restarts ${metrics.workerRestarts} exceeds max ${QueueConfig.HEALTH_MAX_WORKER_RESTARTS}`);

    if (issues.length > 0) {
      logger.error({ queueName, issues }, `[QueueHealthManager] Health thresholds exceeded for ${queueName}. (Legacy fallback disabled in Phase 3H)`);
    }
  }

  // Exposed for testing
  public static resetMetrics() {
    this.metrics.clear();
  }
}
