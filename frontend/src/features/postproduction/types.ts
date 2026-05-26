export type PostProductionTaskType =
  | 'PHOTO_CULLING'
  | 'PHOTO_EDITING'
  | 'VIDEO_EDITING'
  | 'COLOR_GRADING'
  | 'AUDIO_SYNC'
  | 'ALBUM_DESIGN'
  | 'QUALITY_CHECK'
  | 'EXPORT_UPLOAD'
  | 'CLIENT_REVISION'
  | 'OTHER';

export type PostProductionTaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export type PostProductionTaskStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'DONE'
  | 'BLOCKED';

export interface PostProductionTask {
  id: string;
  studioId: string;
  projectId: string;
  deliverableId: string;
  title: string;
  description?: string;
  taskType: PostProductionTaskType;
  priority: PostProductionTaskPriority;
  status: PostProductionTaskStatus;
  assignedEmployeeId?: string;
  dueDate?: string; // YYYY-MM-DD
  estimatedHours?: number;
  actualHours?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type PostProductionSubtaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'BLOCKED';

export interface PostProductionSubtask {
  id: string;
  studioId: string;
  taskId: string;
  title: string;
  description?: string;
  status: PostProductionSubtaskStatus;
  assignedEmployeeId?: string;
  sortOrder: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostProductionTaskUpdateRequest {
  title: string;
  description?: string | null;
  taskType: PostProductionTaskType;
  priority: PostProductionTaskPriority;
  status: PostProductionTaskStatus;
  assignedEmployeeId?: string | null;
  dueDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  sortOrder: number;
}

