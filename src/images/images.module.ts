import { Module } from '@nestjs/common';
import { BrokerModule } from '../broker/broker.module';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  imports: [BrokerModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
