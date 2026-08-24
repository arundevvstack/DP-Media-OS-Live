export const QueueConfig = {
    // Feature flags
    QUEUE_ENABLED: process.env.QUEUE_ENABLED === 'true',
    QUEUE_PROCESSING: process.env.QUEUE_PROCESSING === 'true' || true,

    // Health Thresholds for Rollback
    HEALTH_MAX_FAILURE_RATE: parseFloat(process.env.HEALTH_MAX_FAILURE_RATE || '0.05'), // 5%
    HEALTH_MAX_RETRY_RATE: parseFloat(process.env.HEALTH_MAX_RETRY_RATE || '0.10'), // 10%
    HEALTH_MAX_QUEUE_DELAY_MS: parseInt(process.env.HEALTH_MAX_QUEUE_DELAY_MS || '30000', 10), // 30s
    HEALTH_MAX_DLQ_RATE: parseFloat(process.env.HEALTH_MAX_DLQ_RATE || '0.01'), // 1%
    HEALTH_MAX_PROCESSING_TIME_MS: parseInt(process.env.HEALTH_MAX_PROCESSING_TIME_MS || '60000', 10), // 60s
    HEALTH_MAX_WORKER_RESTARTS: parseInt(process.env.HEALTH_MAX_WORKER_RESTARTS || '3', 10),

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
