import { Worker, Job, WorkerOptions } from 'bullmq';
import { RedisConnectionManager } from '../connection';
import { QueueConfig } from '../config';
import { QueueName } from '../registry';
import { QueueObservability } from '../observability';
import { DeadLetterQueue } from '../dlq';
import { DistributedLockManager } from '../locks';

export abstract class BaseWorker {
  protected worker: Worker;

  constructor(
    protected readonly queueName: QueueName,
    options?: Partial<WorkerOptions>
  ) {
    this.worker = new Worker(
      queueName,
      async (job: Job) => {
        if (!QueueConfig.QUEUE_PROCESSING && !QueueConfig.QUEUE_SHADOW_MODE) {
          return;
        }

        const lockKey = `worker:${queueName}:${job.id}`;
        const acquired = await DistributedLockManager.acquireLock(lockKey);
        if (!acquired) {
          throw new Error('Could not acquire distributed lock for job execution');
        }

        try {
          if (QueueConfig.QUEUE_SHADOW_MODE) {
            await this.processShadow(job);
          } else {
            await this.process(job);
          }
        } finally {
          await DistributedLockManager.releaseLock(lockKey);
        }
      },
      {
        connection: RedisConnectionManager.getConnection(),
        concurrency: QueueConfig.DEFAULT_CONCURRENCY,
        ...options
      }
    );

    this.registerEvents();
  }

  protected abstract process(job: Job): Promise<any>;

  protected async processShadow(job: Job): Promise<any> {
    // In shadow mode, we can validate the payload but discard business side-effects.
    return { shadowProcessed: true };
  }

  private registerEvents() {
    this.worker.on('completed', (job: Job) => {
      QueueObservability.logJobCompletion({
        correlationId: job.data.correlationId,
        jobId: job.id || 'unknown',
        queueName: this.queueName,
        tenantId: job.data.tenantId,
        userId: job.data.userId,
        retries: job.attemptsMade,
        durationMs: Date.now() - job.timestamp,
        queueWaitMs: job.processedOn ? job.processedOn - job.timestamp : 0,
        processingTimeMs: job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : 0
      });
    });

    this.worker.on('failed', async (job: Job | undefined, error: Error) => {
      if (!job) return;

      QueueObservability.logJobFailure({
        correlationId: job.data.correlationId,
        jobId: job.id || 'unknown',
        queueName: this.queueName,
        tenantId: job.data.tenantId,
        userId: job.data.userId,
        retries: job.attemptsMade,
        durationMs: Date.now() - job.timestamp,
        queueWaitMs: job.processedOn ? job.processedOn - job.timestamp : 0,
        processingTimeMs: job.processedOn ? Date.now() - job.processedOn : 0,
        failureReason: error.message
      });

      if (DeadLetterQueue.isPoisonMessage(error) || job.attemptsMade >= QueueConfig.MAX_RETRIES) {
        await DeadLetterQueue.routeToDLQ(job, error.message);
      }
    });
  }

  public async close() {
    await this.worker.close();
  }
}
