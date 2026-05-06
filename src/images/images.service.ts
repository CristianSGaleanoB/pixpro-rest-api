import { Injectable, Logger } from '@nestjs/common';
import { BrokerService } from 'src/broker/broker.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { randomUUID } from 'crypto';
import { ImageUploadedEvent } from 'src/events/schemas/image-uploaded.event';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(private readonly brokerService: BrokerService) {}

  async handleImageUpload(
    dto: UploadImageDto,
    userId: string,
  ): Promise<{ correlationId: string; imageId: string }> {
    const correlationId = randomUUID();
    const imageId = randomUUID();

    const event: ImageUploadedEvent = {
      event: 'ImageUploaded',
      version: '1.0',
      timestamp: new Date().toISOString(),
      correlationId,
      projectId: dto.projectId,
      userId,
      imageId,
      storagePath: dto.storagePath,
      processingOptions: {
        upscaler: dto.upscaler,
        grayscale: dto.grayscale,
        restore: dto.restore,
        watermark: dto.watermark,
      },
    };

    await this.brokerService.publish('image.uploaded', event);

    this.logger.log(
      `ImageUploaded event dispatched - imageId: ${imageId} | correlationId: ${correlationId}`,
    );

    return { correlationId, imageId };
  }
}
