import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const startTime = Date.now();
    const correlationId = (request as Record<string, string>)['x-correlation-id'];

    this.logger.log(`→ ${method} ${url} [${correlationId}]`);

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = response.statusCode;
          const duration = Date.now() - startTime;
          this.logger.log(`← ${method} ${url} [${statusCode}] (${duration}ms) [${correlationId}]`);
        },
        error: (error: { statusCode?: number }) => {
          const statusCode = error?.statusCode ?? 500;
          const duration = Date.now() - startTime;
          this.logger.error(
            `✗ ${method} ${url} [${statusCode}] (${duration}ms) [${correlationId}]`,
          );
        },
      }),
    );
  }
}
