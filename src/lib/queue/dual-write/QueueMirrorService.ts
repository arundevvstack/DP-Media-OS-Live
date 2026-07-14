import { QueueDispatcher } from '../dispatcher';
import { QueueName } from '../registry';

export class QueueMirrorService {
  /**
   * Mirrors a payload directly to BullMQ without awaiting the completion.
   * Provides a fire-and-forget mirror mechanism for the dual-write infrastructure.
   */
  public static mirrorPayload(queueName: QueueName, jobName: string, legacyJobId: string, payload: any): void {
    // We attach the legacyJobId to the payload so the worker can link them during parity validation.
    const mirroredPayload = {
      ...payload,
      _shadowContext: {
        legacyJobId,
        isShadow: true,
        dispatchedAt: Date.now()
      }
    };
    
    // We fire-and-forget. Dispatcher handles shadow mode flags.
    QueueDispatcher.dispatch(queueName, jobName, mirroredPayload).catch(err => {
      // Do nothing on dispatch failure to ensure absolute zero regression on the main thread
    });
  }
}
