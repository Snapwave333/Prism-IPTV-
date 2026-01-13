type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private readonly isDev = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  info(message: string, data?: unknown) {
    if (this.isDev) {
      console.log(this.formatMessage('info', message), data || '');
    }
  }

  warn(message: string, data?: unknown) {
    console.warn(this.formatMessage('warn', message), data || '');
  }

  error(message: string, data?: unknown) {
    console.error(this.formatMessage('error', message), data || '');
  }

  debug(message: string, data?: unknown) {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message), data || '');
    }
  }
}

export const logger = new Logger();
