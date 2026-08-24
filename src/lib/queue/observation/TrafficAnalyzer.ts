import { ProductionEvidenceRepository, JobEvidence } from './ProductionEvidenceRepository';

export interface TrafficMetrics {
  totalJobsProduced: number;
  totalJobsCompleted: number;
  totalJobsFailed: number;
  totalJobsRetried: number;
  totalDlq: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  avgThroughputPerSecond: number;
  queueDepth: number;
  queueSaturation: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
}

export class TrafficAnalyzer {
  public static analyze(): TrafficMetrics {
    const jobs = ProductionEvidenceRepository.getJobEvidence();
    
    if (jobs.length === 0) {
      return {
        totalJobsProduced: 0,
        totalJobsCompleted: 0,
        totalJobsFailed: 0,
        totalJobsRetried: 0,
        totalDlq: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
        avgThroughputPerSecond: 0,
        queueDepth: 0,
        queueSaturation: 'LOW'
      };
    }

    const completed = jobs.filter(j => j.completionStatus === 'SUCCESS').length;
    const failed = jobs.filter(j => j.completionStatus === 'FAILED').length;
    const dlq = jobs.filter(j => j.completionStatus === 'DLQ').length;
    const retried = jobs.reduce((sum, j) => sum + j.retryCount, 0);

    const latencies = jobs.map(j => j.executionDurationMs).sort((a, b) => a - b);
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

    const firstTime = jobs[0].timestamp;
    const lastTime = jobs[jobs.length - 1].timestamp;
    const durationSeconds = Math.max(1, (lastTime - firstTime) / 1000);
    const throughput = jobs.length / durationSeconds;

    return {
      totalJobsProduced: jobs.length,
      totalJobsCompleted: completed,
      totalJobsFailed: failed,
      totalJobsRetried: retried,
      totalDlq: dlq,
      p95LatencyMs: p95,
      p99LatencyMs: p99,
      avgThroughputPerSecond: throughput,
      queueDepth: 0, // Mocked live depth
      queueSaturation: p95 > 2000 ? 'HIGH' : 'NORMAL'
    };
  }
}
