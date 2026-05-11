import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { toBoolean } from '../../common/utils/transform';

export class UploadImageDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  upscaler!: boolean;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  grayscale!: boolean;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  restore!: boolean;

  @IsString()
  @IsOptional()
  watermark?: string;
}
