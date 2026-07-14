import { ParityMismatch } from './MetricsCollector';

export class TimingComparator {
  public static compare(legacyTimeMs: number, shadowTimeMs: number, thresholdMs: number = 1000): ParityMismatch[] {
    const mismatches: ParityMismatch[] = [];
    const diff = Math.abs(legacyTimeMs - shadowTimeMs);
    
    if (diff > thresholdMs) {
      mismatches.push({
        field: 'execution_time',
        legacyValue: legacyTimeMs,
        shadowValue: shadowTimeMs,
        reason: `Execution time variance exceeded threshold of ${thresholdMs}ms`
      });
    }
    return mismatches;
  }
}
