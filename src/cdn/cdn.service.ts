import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import type { UploadedFile as UploadedFileType } from 'src/common/types/uploaded-file.type';

@Injectable()
export class CdnService {
  private readonly logger = new Logger(CdnService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadRawFile(file: UploadedFileType, projectId: string, imageId: string): Promise<string> {
    this.logger.log(`Uploading raw file for project ${projectId} and image ${imageId}`);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `pixpro/raw/${projectId}`,
          public_id: imageId,
          resource_type: 'image',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            const uploadError =
              error instanceof Error
                ? error
                : new Error(error?.message ?? 'Upload returned empty result');

            this.logger.error(`CDN upload failed - imageId: ${imageId}`, uploadError.stack);
            reject(uploadError);
            return;
          }

          this.logger.log(`CDN upload success - url: ${result.secure_url}`);
          resolve(result.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
