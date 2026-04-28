import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadImageDto {
  @IsUUID()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  storagePath!: string;

  @IsBoolean()
  upscaler!: boolean;

  @IsBoolean()
  grayscale!: boolean;

  @IsBoolean()
  restore!: boolean;

  @IsString()
  @IsOptional()
  watermark?: string;
}
