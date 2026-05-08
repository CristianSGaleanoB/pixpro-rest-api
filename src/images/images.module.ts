import { Module } from '@nestjs/common';
import { BrokerModule } from '../broker/broker.module';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { CdnModule } from 'src/cdn/cdn.module';

@Module({
  imports: [BrokerModule, CdnModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
