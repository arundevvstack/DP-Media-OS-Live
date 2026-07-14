import { RedisConnectionManager } from '../connection';
import { QueueConfig } from '../config';

export class DistributedLockManager {
  /**
   * Acquires a distributed lock using Redis SETNX with expiration.
   */
  public static async acquireLock(lockKey: string, ttl: number = QueueConfig.LOCK_DURATION): Promise<boolean> {
    const redis = RedisConnectionManager.getConnection();
    // Using SETNX equivalent with expiration in ioredis: set(key, value, 'PX', ttl, 'NX')
    const result = await redis.set(`lock:${lockKey}`, 'LOCKED', 'PX', ttl, 'NX');
    return result === 'OK';
  }

  /**
   * Releases a distributed lock.
   */
  public static async releaseLock(lockKey: string): Promise<void> {
    const redis = RedisConnectionManager.getConnection();
    await redis.del(`lock:${lockKey}`);
  }

  /**
   * Renews a distributed lock expiration.
   */
  public static async renewLock(lockKey: string, ttl: number = QueueConfig.LOCK_DURATION): Promise<boolean> {
    const redis = RedisConnectionManager.getConnection();
    const result = await redis.pexpire(`lock:${lockKey}`, ttl);
    return result === 1;
  }
}
