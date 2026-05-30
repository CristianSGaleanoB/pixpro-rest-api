import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const route = (request.route as { path?: string } | undefined)?.path || request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const status = String(response.statusCode);
          const duration = (Date.now() - startTime) / 1000;

          this.metrics.httpRequestTotal.labels(method, route, status).inc();
          this.metrics.httpRequestDuration.labels(method, route, status).observe(duration);
        },
        error: (error: { status?: number }) => {
          const status = String(error?.status ?? 500);
          const duration = (Date.now() - startTime) / 1000;

          this.metrics.httpRequestTotal.labels(method, route, status).inc();
          this.metrics.httpRequestDuration.labels(method, route, status).observe(duration);
        },
      }),
    );
  }
}
