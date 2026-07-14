import { Queue } from 'bullmq';
import { RedisConnectionManager } from '../connection';
import { QueueConfig } from '../config';

export enum QueueName {
  AI_JOBS = 'ai-jobs',
  WORKFLOW_JOBS = 'workflow-jobs',
  NOTIFICATIONS = 'notifications',
  EMAILS = 'emails',
  RENDERING = 'rendering',
  MEDIA_PROCESSING = 'media-processing',
  EXPORTS = 'exports',
  REPORTS = 'reports',
  AUTOMATION = 'automation',
  DEAD_LETTER = 'dead-letter'
}

export class QueueRegistry {
  private static queues: Map<string, Queue> = new Map();

  public static getQueue(name: QueueName): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: RedisConnectionManager.getConnection(),
        defaultJobOptions: {
          attempts: QueueConfig.MAX_RETRIES,
          backoff: {
            type: 'exponential',
            delay: 2000
          },
          removeOnComplete: 1000,
          removeOnFail: 5000
        }
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }
}
