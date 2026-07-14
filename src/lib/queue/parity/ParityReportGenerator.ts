import { ParityReport } from './MetricsCollector';
import { logger } from '@/lib/observability/logger';

export class ParityReportGenerator {
  public static generateSummary(reports: ParityReport[]): void {
    const total = reports.length;
    const matches = reports.filter(r => r.matched).length;
    const mismatches = total - matches;
    
    logger.info('Queue Parity Summary Report', {
      eventType: 'QUEUE_PARITY_SUMMARY',
      totalJobs: total,
      matchedJobs: matches,
      mismatchedJobs: mismatches,
      successRate: total > 0 ? (matches / total) * 100 : 100
    });
  }
}
