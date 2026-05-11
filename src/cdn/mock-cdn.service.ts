import { Injectable, Logger } from '@nestjs/common';
import type { UploadedFile as UploadedFileType } from 'src/common/types/uploaded-file.type';

@Injectable()
export class MockCdnService {
  private readonly logger = new Logger(MockCdnService.name);

  async uploadRawFile(
    _file: UploadedFileType,
    projectId: string,
    imageId: string,
  ): Promise<string> {
    const fakeUrl = `https://cdn.pixpro.local/mock/${projectId}/${imageId}`;

    this.logger.log(`[MOCK] Uploading raw file for project ${projectId} and image ${imageId}`);
    this.logger.log(`[MOCK] CDN upload success — url: ${fakeUrl}`);

    return fakeUrl;
  }
}
