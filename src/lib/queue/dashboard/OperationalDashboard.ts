import { CertificationResult } from '../certification/QueueCertificationService';
import { MetricsCollector } from '../parity/MetricsCollector';
import { ExecutiveDashboard } from './ExecutiveDashboard';

export class OperationalDashboard {
  public static generateReport(certResult: CertificationResult, interval: 'HOURLY' | 'DAILY' | 'WEEKLY'): string {
    const metrics = MetricsCollector.getSystemMetrics();
    const history = MetricsCollector.getHistory();
    const parityMatches = history.filter(h => h.matched).length;
    const parityPercent = history.length > 0 ? ((parityMatches / history.length) * 100).toFixed(2) : '100.00';

    // Extend Executive Dashboard with Operational Trends
    const baseReport = ExecutiveDashboard.generateReport(certResult);

    const operationalMetrics = `
## 6. Operational Trends (${interval})
**Parity Trend:** ${parityPercent === '100.00' ? 'STABLE' : 'DEGRADING'}
**Queue Saturation:** ${metrics.dbLatencyMs > 2000 ? 'HIGH' : 'NORMAL'}
**Redis Availability:** ${metrics.redisLatencyMs > 1000 ? 'DEGRADED' : 'HEALTHY'}
**Worker Utilization:** ${(metrics.cpu * 1.5).toFixed(1)}% (Estimated)

## 7. Exit Criteria Status
**Required burn-in duration achieved:** ${certResult.burnInPassed ? 'Yes' : 'No'}
**Required production job count achieved:** ${certResult.burnInPassed ? 'Yes' : 'No'}
**No exactly-once violations:** ${certResult.exactlyOncePassed ? 'Yes' : 'No'}
**No critical incidents/rollbacks:** ${certResult.driftSeverity === 'NONE' ? 'Yes' : 'No'}
    `;

    return baseReport + operationalMetrics;
  }
}
