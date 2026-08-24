import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueueConfig, QueueRegistry, QueueName, DistributedLockManager, QueueDispatcher, DeadLetterQueue, QueueObservability } from '../../src/lib/queue';

// Mock bullmq
vi.mock('bullmq', () => {
  class QueueMock {
    name: string;
    add = vi.fn().mockResolvedValue({ id: 'test-job-id', name: 'test-job' });
    constructor(name: string) {
      this.name = name;
    }
  }
  
  class WorkerMock {
    on = vi.fn();
    close = vi.fn();
  }

  return {
    Queue: QueueMock,
    Worker: WorkerMock
  };
});

// Mock ioredis
vi.mock('ioredis', () => {
  class RedisMock {
    on = vi.fn();
    quit = vi.fn().mockResolvedValue(true);
    set = vi.fn().mockResolvedValue('OK');
    del = vi.fn().mockResolvedValue(1);
    pexpire = vi.fn().mockResolvedValue(1);
    ping = vi.fn().mockResolvedValue('PONG');
  }
  return { default: RedisMock };
});

describe('Phase 3A - Distributed Queue Foundation', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    QueueConfig.QUEUE_ENABLED = true;
  });

  it('QueueRegistry creates and caches queues', () => {
    const q1 = QueueRegistry.getQueue(QueueName.AI_JOBS);
    const q2 = QueueRegistry.getQueue(QueueName.AI_JOBS);
    const q3 = QueueRegistry.getQueue(QueueName.EMAILS);

    expect(q1).toBe(q2); // Should be cached
    expect(q1).not.toBe(q3);
  });

  it('QueueDispatcher dispatches to bullmq', async () => {
    const jobId = await QueueDispatcher.dispatch(QueueName.AI_JOBS, 'GenerateImage', { prompt: 'test' });
    
    expect(jobId).toBe('test-job-id');
  });

  it('QueueDispatcher opts out entirely if queues disabled', async () => {
    QueueConfig.QUEUE_ENABLED = false;
    
    const jobId = await QueueDispatcher.dispatch(QueueName.AI_JOBS, 'GenerateImage', { prompt: 'test' });
    expect(jobId).toBeNull();
  });

  it('DistributedLockManager acquires locks correctly', async () => {
    const acquired = await DistributedLockManager.acquireLock('job-1', 5000);
    expect(acquired).toBe(true);
  });

  it('DeadLetterQueue routes to DLQ correctly', async () => {
    const dlqSpy = vi.spyOn(QueueObservability, 'logDeadLetterRouting');
    const mockJob: any = {
      id: 'job-999',
      queueName: 'ai-jobs',
      name: 'GenerateVideo',
      data: { correlationId: 'c-1' },
      attemptsMade: 3,
      timestamp: Date.now()
    };
    
    await DeadLetterQueue.routeToDLQ(mockJob, 'Max retries reached');
    expect(dlqSpy).toHaveBeenCalled();
  });

  it('DeadLetterQueue identifies poison messages correctly', () => {
    const syntaxErr = new SyntaxError('Unexpected token');
    expect(DeadLetterQueue.isPoisonMessage(syntaxErr)).toBe(true);
    
    const validErr = new Error('Validation Failed on input');
    expect(DeadLetterQueue.isPoisonMessage(validErr)).toBe(true);
    
    const timeoutErr = new Error('Connection timeout');
    expect(DeadLetterQueue.isPoisonMessage(timeoutErr)).toBe(false);
  });
});
