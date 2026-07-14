import { MetricsCollector } from '../parity';

export class ShadowExecutionManager {
  /**
   * Safely wraps shadow execution block to intercept and discard any side effects
   * such as database mutations.
   * In a real implementation, this would use a proxy or mock dependency injection
   * to ensure no network or DB calls are executed. For now, it evaluates the function.
   */
  public static async executeShadow<T>(jobId: string, fn: () => Promise<T>): Promise<T> {
    try {
      // Note: We inject context or mock dependencies here in a full DI setup.
      // For this phase, we assume the worker explicitly knows it is in shadow mode
      // and bypasses actual saves internally, or we use transaction rollback.
      
      const result = await fn();
      return result;
    } catch (e) {
      throw e;
    }
  }

  public static interceptSideEffect(jobId: string, action: string, data: any): void {
    MetricsCollector.recordSideEffectAttempted(jobId, action, data);
  }
}
