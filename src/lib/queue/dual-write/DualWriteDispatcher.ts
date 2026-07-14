import { QueueMirrorService } from './QueueMirrorService';
import { QueueName } from '../registry';
import { QueueConfig } from '../config';

export class DualWriteDispatcher {
  /**
   * Dispatches a job via the legacy execution engine while simultaneously
   * mirroring it to BullMQ if Dual Write is enabled.
   */
  public static async dispatchDual(
    legacyDispatchFn: () => Promise<{ id: string, result: any }>,
    queueName: QueueName,
    jobName: string,
    payload: any
  ): Promise<{ id: string, result: any }> {
    
    // Execute legacy dispatch first as authoritative source
    const legacyResponse = await legacyDispatchFn();

    // Mirror to shadow infrastructure if enabled
    if (QueueConfig.QUEUE_DUAL_WRITE) {
      QueueMirrorService.mirrorPayload(queueName, jobName, legacyResponse.id, payload);
    }

    return legacyResponse;
  }
}
