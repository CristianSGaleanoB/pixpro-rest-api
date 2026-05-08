import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true' || normalized === '1') {
      return true;
    }

    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }

  return Boolean(value);
}

export class UploadImageDto {
  @IsUUID()
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
