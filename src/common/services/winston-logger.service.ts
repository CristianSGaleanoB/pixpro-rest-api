import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const isDev = process.env.NODE_ENV === 'development';

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      defaultMeta: { service: 'rest-api' },
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: isDev
            ? winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                  ({
                    timestamp,
                    level,
                    message,
                    context,
                    trace,
                    ...meta
                  }: Record<string, unknown>) => {
                    const contextStr = typeof context === 'string' ? context : '';
                    const ctx = contextStr ? `[${contextStr}]` : '';
                    const msg = `${String(timestamp)} ${String(level)}: ${String(message)} ${ctx}`;
                    const extra =
                      Object.keys(meta).length > 1 ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
                    const traceStr = typeof trace === 'string' ? trace : '';
                    const stack = traceStr ? `\n  ${traceStr}` : '';
                    return `${msg}${extra}${stack}`;
                  },
                ),
              )
            : winston.format.json(),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 10,
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
