import { QueueName } from '../registry';
import { QueueDispatcher } from '../dispatcher';

export class EnterpriseQueueRouter {
  /**
   * Routes the job exclusively to BullMQ. Legacy Prisma queues have been decommissioned.
   */
  public static async dispatchPrimary<T extends { id: string }>(
    queueName: QueueName,
    jobName: string,
    payload: any
  ): Promise<{ id: string, bullMqJobId: string }> {
    // BullMQ is Primary. We dispatch to BullMQ.
    const bullMqPayload = {
      ...payload
    };

    // Dispatch to BullMQ
    const bullMqJobId = await QueueDispatcher.dispatch(queueName, jobName, bullMqPayload);

    // We return the BullMQ job id masked as the response 
    return { id: bullMqJobId, bullMqJobId };
  }
}
