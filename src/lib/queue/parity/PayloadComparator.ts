import { ParityMismatch } from './MetricsCollector';

export class PayloadComparator {
  public static compare(legacyPayload: any, shadowPayload: any): ParityMismatch[] {
    const mismatches: ParityMismatch[] = [];
    const legacyStr = JSON.stringify(legacyPayload || {});
    const shadowStr = JSON.stringify(shadowPayload || {});
    
    if (legacyStr !== shadowStr) {
      mismatches.push({
        field: 'payload',
        legacyValue: legacyPayload,
        shadowValue: shadowPayload,
        reason: 'Payloads are structurally or content-wise different'
      });
    }
    return mismatches;
  }
}
