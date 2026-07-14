export const QueueConfig = {
    // Feature flags
    QUEUE_ENABLED: process.env.QUEUE_ENABLED === 'true',
    QUEUE_SHADOW_MODE: process.env.QUEUE_SHADOW_MODE === 'true' || true, // Default true as per Phase 3A
    QUEUE_DUAL_WRITE: process.env.QUEUE_DUAL_WRITE === 'true',
    QUEUE_PROCESSING: process.env.QUEUE_PROCESSING === 'true',
  
    // Connection
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_TLS: process.env.REDIS_TLS === 'true',
  
    // Workers
    DEFAULT_CONCURRENCY: 5,
    MAX_RETRIES: 3,
    LOCK_DURATION: 30000,
  };
