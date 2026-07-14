import { ParityMismatch } from './MetricsCollector';

export class ResultComparator {
  public static compare(legacyResult: any, shadowResult: any): ParityMismatch[] {
    const mismatches: ParityMismatch[] = [];
    const legacyStr = JSON.stringify(legacyResult || {});
    const shadowStr = JSON.stringify(shadowResult || {});
    
    if (legacyStr !== shadowStr) {
      mismatches.push({
        field: 'result_data',
        legacyValue: legacyResult,
        shadowValue: shadowResult,
        reason: 'Generated output results do not match'
      });
    }
    
    return mismatches;
  }
}
