import { RedisConnectionManager } from '../connection';

export class QueueHealthMonitor {
  /**
   * Pings Redis to ensure the connection is alive and healthy.
   */
  public static async checkHealth(): Promise<{ status: 'healthy' | 'unhealthy', latencyMs: number }> {
    const redis = RedisConnectionManager.getConnection();
    const start = Date.now();
    try {
      const ping = await redis.ping();
      if (ping !== 'PONG') throw new Error('Invalid Redis Response');
      return {
        status: 'healthy',
        latencyMs: Date.now() - start
      };
    } catch (e) {
      return {
        status: 'unhealthy',
        latencyMs: Date.now() - start
      };
    }
  }
}
