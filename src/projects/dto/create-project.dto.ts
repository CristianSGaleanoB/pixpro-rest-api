import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;
  @IsString()
  ownerId: string;
  @IsString({ each: true })
  @IsOptional()
  tags: string[];
  @IsNumber()
  @IsOptional()
  totalImages: number;
  @IsBoolean()
  @IsOptional()
  isPublic: boolean;
}
