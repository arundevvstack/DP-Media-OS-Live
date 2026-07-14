import { Job } from 'bullmq';
import { QueueRegistry, QueueName } from '../registry';
import { QueueObservability } from '../observability';

export class DeadLetterQueue {
  /**
   * Routes a poisoned or permanently failed job to the DLQ.
   */
  public static async routeToDLQ(job: Job, reason: string): Promise<void> {
    const dlq = QueueRegistry.getQueue(QueueName.DEAD_LETTER);
    
    await dlq.add(job.name, {
      originalJobId: job.id,
      originalQueue: job.queueName,
      data: job.data,
      reason,
      failedAt: new Date().toISOString()
    });

    QueueObservability.logDeadLetterRouting({
      correlationId: job.data.correlationId || 'unknown',
      jobId: job.id || 'unknown',
      queueName: job.queueName,
      retries: job.attemptsMade,
      durationMs: Date.now() - job.timestamp,
      queueWaitMs: job.processedOn ? job.processedOn - job.timestamp : 0,
      processingTimeMs: job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : 0,
      failureReason: reason,
      dlqStatus: true
    });
  }

  /**
   * Checks if an error warrants permanent DLQ routing instead of backoff retry.
   */
  public static isPoisonMessage(error: Error): boolean {
    // Structural failures, malformed payloads, explicit non-retryable domain errors
    if (error.name === 'SyntaxError' || error.message.includes('malformed') || error.message.includes('Validation Failed')) {
      return true;
    }
    return false;
  }
}
