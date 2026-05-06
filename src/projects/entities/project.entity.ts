import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProjectStatus } from './project-status.entity';

export type ProjectDocument = HydratedDocument<Project>;

@Schema()
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  totalImages: number;

  @Prop({ default: 0 })
  processedImages: number;

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @Prop({ default: false })
  isPublic: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
