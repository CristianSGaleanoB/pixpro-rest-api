import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MetricsModule } from '../metrics/metrics.module';
import { BrokerService } from './broker.service';

@Module({
  imports: [ConfigModule, MetricsModule],
  providers: [BrokerService],
  exports: [BrokerService],
})
export class BrokerModule {}
