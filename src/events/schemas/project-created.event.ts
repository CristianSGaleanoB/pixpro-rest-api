import { BaseEvent } from './base-event.interface';

export interface ProjectCreatedEvent extends BaseEvent {
  event: 'ProjectCreated';
  version: '1.0';
  _id: string;
  name: string;
  ownerId: string;
  tags: string[];
  totalImages: number;
  processedImages: number;
  status: string;
  isPublic: boolean;
}
