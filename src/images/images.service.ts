import { Injectable, Logger } from '@nestjs/common';
import { BrokerService } from 'src/broker/broker.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { randomUUID } from 'crypto';
import { ImageUploadedEvent } from 'src/events/schemas/image-uploaded.event';
import { CdnService } from 'src/cdn/cdn.service';
import type { UploadedFile as UploadedFileType } from 'src/common/types/uploaded-file.type';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly brokerService: BrokerService,
    private readonly cdnService: CdnService,
  ) {}

  async handleImageUpload(
    file: UploadedFileType,
    dto: UploadImageDto,
    userId: string,
  ): Promise<{ correlationId: string; imageId: string }> {
    const correlationId = randomUUID();
    const imageId = randomUUID();

    const storagePath: string = await this.cdnService.uploadRawFile(file, dto.projectId, imageId);

    const event: ImageUploadedEvent = {
      event: 'ImageUploaded',
      version: '1.0',
      timestamp: new Date().toISOString(),
      correlationId,
      projectId: dto.projectId,
      userId,
      imageId,
      storagePath,
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
