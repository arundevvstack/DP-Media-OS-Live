export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  transactionId?: string;
  correlationId?: string;
  userId?: string;
  tenantId?: string;
  service?: string;
  domain?: string;
  durationMs?: number;
  [key: string]: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      error: error ? { message: error.message, stack: error.stack, name: error.name } : undefined,
    };
    return JSON.stringify(logEntry);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage(LogLevel.INFO, message, context));
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context, error));
  }

  error(message: string, error: Error, context?: LogContext): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, context, error));
  }
}

export const logger = new Logger();
