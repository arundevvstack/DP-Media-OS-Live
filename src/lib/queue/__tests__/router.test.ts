import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnterpriseQueueRouter } from '../router/EnterpriseQueueRouter';
import { QueueName } from '../registry';
import { QueueDispatcher } from '../dispatcher';

vi.mock('../dispatcher', () => ({
  QueueDispatcher: {
    dispatch: vi.fn().mockResolvedValue('bullmq-123')
  }
}));

describe('EnterpriseQueueRouter - Phase 3H', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches directly to BullMQ without dual-write or legacy fallbacks', async () => {
    const result = await EnterpriseQueueRouter.dispatchPrimary(
      QueueName.NOTIFICATIONS,
      'test-job',
      { data: 'test' }
    );

    expect(result).toEqual({ id: 'bullmq-123', bullMqJobId: 'bullmq-123' });
    
    expect(QueueDispatcher.dispatch).toHaveBeenCalledOnce();
    const callArgs = vi.mocked(QueueDispatcher.dispatch).mock.calls[0];
    expect(callArgs[0]).toBe(QueueName.NOTIFICATIONS);
    expect(callArgs[1]).toBe('test-job');
    expect(callArgs[2]).toEqual({ data: 'test' });
  });
});
