import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  QueueConfig, 
  DualWriteDispatcher, 
  ShadowExecutionManager, 
  ParityValidator,
  ExecutionComparator,
  QueueName,
  MetricsCollector,
  QueueDispatcher
} from '../../src/lib/queue';

// Spy on dependencies
vi.mock('../../src/lib/queue/dispatcher/index', () => ({
  QueueDispatcher: {
    dispatch: vi.fn().mockResolvedValue('shadow-id')
  }
}));

describe('Phase 3B - Dual-Write Queue Migration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    QueueConfig.QUEUE_ENABLED = true;
    QueueConfig.QUEUE_SHADOW_MODE = true;
    QueueConfig.QUEUE_DUAL_WRITE = true;
  });

  describe('DualWriteDispatcher', () => {
    it('executes legacy dispatch and mirrors to queue when DUAL_WRITE is true', async () => {
      const mockLegacyDispatch = vi.fn().mockResolvedValue({ id: 'legacy-123', result: 'success' });
      
      const res = await DualWriteDispatcher.dispatchDual(
        mockLegacyDispatch,
        QueueName.AI_JOBS,
        'ProcessAI',
        { prompt: 'test' }
      );

      expect(res.id).toBe('legacy-123');
      expect(mockLegacyDispatch).toHaveBeenCalled();
      expect(QueueDispatcher.dispatch).toHaveBeenCalledWith(
        QueueName.AI_JOBS,
        'ProcessAI',
        expect.objectContaining({ 
          prompt: 'test', 
          _shadowContext: expect.objectContaining({ legacyJobId: 'legacy-123', isShadow: true }) 
        })
      );
    });

    it('does not mirror to queue when DUAL_WRITE is false', async () => {
      QueueConfig.QUEUE_DUAL_WRITE = false;
      const mockLegacyDispatch = vi.fn().mockResolvedValue({ id: 'legacy-123', result: 'success' });
      
      await DualWriteDispatcher.dispatchDual(
        mockLegacyDispatch,
        QueueName.AI_JOBS,
        'ProcessAI',
        { prompt: 'test' }
      );

      expect(QueueDispatcher.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('ShadowExecutionManager', () => {
    it('executes the shadow function safely', async () => {
      const fn = vi.fn().mockResolvedValue('shadow-result');
      const result = await ShadowExecutionManager.executeShadow('job-1', fn);
      expect(result).toBe('shadow-result');
      expect(fn).toHaveBeenCalled();
    });

    it('intercepts side effects and logs them without throwing', () => {
      const spy = vi.spyOn(MetricsCollector, 'recordSideEffectAttempted');
      ShadowExecutionManager.interceptSideEffect('job-1', 'DB_MUTATION', { table: 'User' });
      expect(spy).toHaveBeenCalledWith('job-1', 'DB_MUTATION', { table: 'User' });
    });
  });

  describe('Parity Validation', () => {
    it('ExecutionComparator matches identical outputs', () => {
      const mismatches = ExecutionComparator.compare({
        legacyPayload: { a: 1 },
        shadowPayload: { a: 1 },
        legacyTimeMs: 100,
        shadowTimeMs: 120, // Within 1000ms threshold
        legacyError: null,
        shadowError: null,
        legacyResult: { status: 'ok' },
        shadowResult: { status: 'ok' }
      });
      expect(mismatches.length).toBe(0);
    });

    it('ExecutionComparator detects payload mismatch', () => {
      const mismatches = ExecutionComparator.compare({
        legacyPayload: { a: 1 },
        shadowPayload: { a: 2 },
        legacyTimeMs: 100,
        shadowTimeMs: 100,
        legacyError: null,
        shadowError: null,
        legacyResult: { status: 'ok' },
        shadowResult: { status: 'ok' }
      });
      expect(mismatches.length).toBe(1);
      expect(mismatches[0].field).toBe('payload');
    });

    it('ExecutionComparator detects timing difference beyond threshold', () => {
      const mismatches = ExecutionComparator.compare({
        legacyPayload: { a: 1 },
        shadowPayload: { a: 1 },
        legacyTimeMs: 100,
        shadowTimeMs: 1500, // > 1000ms threshold
        legacyError: null,
        shadowError: null,
        legacyResult: { status: 'ok' },
        shadowResult: { status: 'ok' }
      });
      expect(mismatches.length).toBe(1);
      expect(mismatches[0].field).toBe('execution_time');
    });

    it('ExecutionComparator detects failure status mismatch', () => {
      const mismatches = ExecutionComparator.compare({
        legacyPayload: { a: 1 },
        shadowPayload: { a: 1 },
        legacyTimeMs: 100,
        shadowTimeMs: 100,
        legacyError: null,
        shadowError: new Error('Failed in shadow'),
        legacyResult: { status: 'ok' },
        shadowResult: null
      });
      expect(mismatches.length).toBe(1);
      expect(mismatches[0].field).toBe('failure_status');
    });

    it('ExecutionComparator detects result mismatch', () => {
      const mismatches = ExecutionComparator.compare({
        legacyPayload: { a: 1 },
        shadowPayload: { a: 1 },
        legacyTimeMs: 100,
        shadowTimeMs: 100,
        legacyError: null,
        shadowError: null,
        legacyResult: { status: 'ok' },
        shadowResult: { status: 'failed' }
      });
      expect(mismatches.length).toBe(1);
      expect(mismatches[0].field).toBe('result_data');
    });

    it('ParityValidator logs matches to observability', () => {
      const spy = vi.spyOn(MetricsCollector, 'recordParityReport');
      const report = ParityValidator.validate('shadow-1', 'legacy-1', QueueName.AI_JOBS, {
        legacyPayload: { a: 1 },
        shadowPayload: { a: 1 },
        legacyTimeMs: 100,
        shadowTimeMs: 100,
        legacyError: null,
        shadowError: null,
        legacyResult: { status: 'ok' },
        shadowResult: { status: 'ok' }
      });

      expect(report.matched).toBe(true);
      expect(spy).toHaveBeenCalledWith(report);
    });
  });
});
