import { QueueConfig } from '../config';
import { QueueRegistry, QueueName } from '../registry';
import { QueueObservability } from '../observability';

export class QueueDispatcher {
  /**
   * Dispatches a job to the enterprise queue.
   * If shadow mode is enabled, it records the dispatch but does not disrupt existing flows.
   */
  public static async dispatch(
    queueName: QueueName,
    jobName: string,
    payload: any,
    options?: any
  ): Promise<string | null> {
    if (!QueueConfig.QUEUE_ENABLED && !QueueConfig.QUEUE_SHADOW_MODE) {
      return null; // Opt-out entirely
    }

    const queue = QueueRegistry.getQueue(queueName);
    
    // In shadow mode, we can dispatch to BullMQ but workers are flagged to shadow process
    const job = await queue.add(jobName, payload, options);
    
    if (QueueConfig.QUEUE_SHADOW_MODE) {
      QueueObservability.logShadowModeDispatched(queueName, job.id || 'unknown');
    }
    
    return job.id || null;
  }
}
