import { ProductionObservationManager, ObservationReport } from './ProductionObservationManager';

export class ExecutiveObservationDashboard {
  public static generateDashboard(): string {
    const report: ObservationReport = ProductionObservationManager.generateReport();
    
    // Scores
    let queueReliabilityScore = 100 - (report.traffic.totalJobsFailed / (report.traffic.totalJobsProduced || 1) * 10000);
    let exactlyOnceScore = report.parity.sideEffectDriftEvents === 0 && report.parity.duplicateJobs === 0 ? 100 : 0;
    let productionStabilityScore = report.incidents.length === 0 ? 100 : 100 - (report.incidents.length * 10);
    let operationalSlaScore = report.sla.passed ? 100 : 50;

    let recommendation = 'NOT READY';
    if (report.burnInSatisfied && report.sla.passed && exactlyOnceScore === 100) {
      recommendation = 'READY FOR DECOMMISSION';
    } else if (!report.burnInSatisfied && report.sla.passed) {
      recommendation = 'READY WITH CONDITIONS (Awaiting Burn In time)';
    }

    return `
# Phase 3G - Real Production Observation Dashboard (Enterprise Burn-In)

## Executive Summary
**Recommendation:** ${recommendation}
**Burn-In Status:** ${report.burnInStatus}

## Live Scores
- **Queue Reliability Score:** ${Math.max(0, queueReliabilityScore).toFixed(1)} / 100
- **Exactly Once Score:** ${exactlyOnceScore} / 100
- **Production Stability Score:** ${Math.max(0, productionStabilityScore).toFixed(1)} / 100
- **Operational SLA Score:** ${operationalSlaScore} / 100

## Overall Queue Health
- **Runtime Hours:** ${report.runtimeHours.toFixed(2)}
- **Total Real Jobs:** ${report.totalRealJobsProcessed}
- **Queue Saturation:** ${report.traffic.queueSaturation}
- **P95 Latency:** ${report.traffic.p95LatencyMs}ms
- **Throughput:** ${report.traffic.avgThroughputPerSecond.toFixed(2)} jobs/sec

## SLA Compliance
**Status:** ${report.sla.passed ? 'PASSED' : 'FAILED'}
${report.sla.violations.map(v => `- [VIOLATION] ${v}`).join('\n')}

## Exactly-Once & Drift Validation
- **Missing Jobs:** ${report.parity.missingJobs}
- **Ghost Jobs:** ${report.parity.ghostJobs}
- **Side Effect Leaks:** ${report.parity.sideEffectDriftEvents}
- **Timing Drift:** ${report.parity.timingDriftEvents}
- **Overall Parity:** ${(report.parity.overallParityScore * 100).toFixed(4)}%

## Incident & Rollback Timeline
**Total Incidents:** ${report.incidents.length}
**Total Rollbacks:** ${report.rollbacks.length}
${report.rollbacks.map(r => `- [${new Date(r.timestamp).toISOString()}] ${r.queueAffected}: ${r.triggerEvent}`).join('\n')}
    `;
  }
}
