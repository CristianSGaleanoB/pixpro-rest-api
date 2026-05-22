import { BaseEvent } from './base-event.interface';

export interface ProjectDeletedEvent extends BaseEvent {
  event: 'ProjectDeleted';
  version: '1.0';
  _id: string;
  ownerId: string;
}
