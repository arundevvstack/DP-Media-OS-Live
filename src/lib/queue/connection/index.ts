import Redis, { RedisOptions } from 'ioredis';
import { QueueConfig } from '../config';

class RedisConnectionManager {
  private static instance: Redis;

  public static getConnection(): Redis {
    if (!this.instance) {
      const options: RedisOptions = {
        host: QueueConfig.REDIS_HOST,
        port: QueueConfig.REDIS_PORT,
        password: QueueConfig.REDIS_PASSWORD,
        tls: QueueConfig.REDIS_TLS ? {} : undefined,
        maxRetriesPerRequest: null, // Required by BullMQ
        retryStrategy(times) {
          return Math.min(times * 50, 2000);
        },
      };
      
      this.instance = new Redis(options);
      
      this.instance.on('error', (err) => {
        // We do not console log per requirements, rely on pino in observability
      });
    }
    
    return this.instance;
  }

  public static async closeConnection(): Promise<void> {
    if (this.instance) {
      await this.instance.quit();
    }
  }
}

export { RedisConnectionManager };
