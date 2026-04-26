import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ImagesService } from './images.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.ACCEPTED)
  async uploadImage(
    @Body() dto: UploadImageDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string; correlationId: string }> {
    const correlationId = await this.imagesService.handleImageUpload(dto, user.sub);

    return {
      message: 'Image queued for processing',
      correlationId,
    };
  }
}
