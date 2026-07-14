import { ParityMismatch } from './MetricsCollector';

export class FailureComparator {
  public static compare(legacyError: Error | null, shadowError: Error | null): ParityMismatch[] {
    const mismatches: ParityMismatch[] = [];
    
    if (!!legacyError !== !!shadowError) {
      mismatches.push({
        field: 'failure_status',
        legacyValue: legacyError ? 'failed' : 'success',
        shadowValue: shadowError ? 'failed' : 'success',
        reason: 'One execution failed while the other succeeded'
      });
      return mismatches; // Avoid deep comparison if one succeeded
    }

    if (legacyError && shadowError) {
      if (legacyError.message !== shadowError.message) {
        mismatches.push({
          field: 'error_message',
          legacyValue: legacyError.message,
          shadowValue: shadowError.message,
          reason: 'Different error messages generated'
        });
      }
      if (legacyError.name !== shadowError.name) {
        mismatches.push({
          field: 'error_type',
          legacyValue: legacyError.name,
          shadowValue: shadowError.name,
          reason: 'Different error types generated'
        });
      }
    }
    
    return mismatches;
  }
}
