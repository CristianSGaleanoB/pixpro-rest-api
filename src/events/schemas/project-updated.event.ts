import { BaseEvent } from './base-event.interface';

export interface ProjectUpdatedEvent extends BaseEvent {
  event: 'ProjectUpdated';
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
