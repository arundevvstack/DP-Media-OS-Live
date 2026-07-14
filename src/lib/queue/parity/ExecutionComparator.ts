import { PayloadComparator } from './PayloadComparator';
import { TimingComparator } from './TimingComparator';
import { FailureComparator } from './FailureComparator';
import { ResultComparator } from './ResultComparator';
import { ParityMismatch } from './MetricsCollector';

export interface ParityInput {
  legacyPayload: any;
  shadowPayload: any;
  legacyTimeMs: number;
  shadowTimeMs: number;
  legacyError: Error | null;
  shadowError: Error | null;
  legacyResult: any;
  shadowResult: any;
}

export class ExecutionComparator {
  public static compare(input: ParityInput): ParityMismatch[] {
    const mismatches: ParityMismatch[] = [];
    
    mismatches.push(...PayloadComparator.compare(input.legacyPayload, input.shadowPayload));
    mismatches.push(...TimingComparator.compare(input.legacyTimeMs, input.shadowTimeMs));
    mismatches.push(...FailureComparator.compare(input.legacyError, input.shadowError));
    
    // Only compare results if both succeeded
    if (!input.legacyError && !input.shadowError) {
      mismatches.push(...ResultComparator.compare(input.legacyResult, input.shadowResult));
    }
    
    return mismatches;
  }
}
