import { ExecutionComparator, ParityInput } from './ExecutionComparator';
import { MetricsCollector, ParityReport } from './MetricsCollector';

export class ParityValidator {
  public static validate(
    jobId: string, 
    legacyJobId: string, 
    queueName: string, 
    input: ParityInput
  ): ParityReport {
    const mismatches = ExecutionComparator.compare(input);
    
    const report: ParityReport = {
      jobId,
      legacyJobId,
      queueName,
      matched: mismatches.length === 0,
      mismatches,
      timingDifferenceMs: Math.abs(input.legacyTimeMs - input.shadowTimeMs),
      shadowExecutionTimeMs: input.shadowTimeMs,
      legacyExecutionTimeMs: input.legacyTimeMs,
      shadowStatus: input.shadowError ? 'failed' : 'completed',
      legacyStatus: input.legacyError ? 'failed' : 'completed'
    };
    
    MetricsCollector.recordParityReport(report);
    
    return report;
  }
}
