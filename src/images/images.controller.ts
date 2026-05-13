import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import type { UploadedFile as UploadedFileType } from 'src/common/types/uploaded-file.type';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max (can be changed)
      fileFilter: (_req, file, callback) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp']; // only available types for now
        if (!allowed.includes(file.mimetype)) {
          return callback(
            new BadRequestException(`File type not allowed: ${file.mimetype}`),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: UploadedFileType,
    @Body() dto: UploadImageDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string; correlationId: string; imageId: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const { correlationId, imageId } = await this.imagesService.handleImageUpload(
      file,
      dto,
      user?.sub,
    );

    return {
      message: 'Image queued for processing',
      correlationId,
      imageId,
    };
  }
}
