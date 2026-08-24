import { QueueConfig } from '../config';
import { QueueRegistry, QueueName } from '../registry';

export class QueueDispatcher {
  /**
   * Dispatches a job directly to the enterprise queue (BullMQ).
   */
  public static async dispatch(
    queueName: QueueName,
    jobName: string,
    payload: any,
    options?: any
  ): Promise<string | null> {
    if (!QueueConfig.QUEUE_ENABLED) {
      return null;
    }

    const queue = QueueRegistry.getQueue(queueName);
    
    // Dispatch to BullMQ
    const job = await queue.add(jobName, payload, options);
    
    return job.id || null;
  }
}
