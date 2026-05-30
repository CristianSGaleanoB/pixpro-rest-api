import { Injectable, OnModuleInit } from '@nestjs/common';
import client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register: client.Registry;

  public httpRequestDuration: client.Histogram<string>;
  public httpRequestTotal: client.Counter<string>;
  public eventsPublishedTotal: client.Counter<string>;
  public activeConnections: client.Gauge<string>;

  constructor() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });
  }

  onModuleInit() {
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.eventsPublishedTotal = new client.Counter({
      name: 'events_published_total',
      help: 'Total events published to RabbitMQ',
      labelNames: ['routing_key', 'status'],
      registers: [this.register],
    });

    this.activeConnections = new client.Gauge({
      name: 'active_connections',
      help: 'Active connections',
      labelNames: ['service'],
      registers: [this.register],
    });

    this.activeConnections.labels('rest-api').set(1);
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
