export type DeliverableType =
  | 'PHOTOS'
  | 'TEASER'
  | 'FULL_VIDEO'
  | 'ALBUM_SELECTION'
  | 'ALBUM_DESIGN'
  | 'ALBUM_PRINT'
  | 'HARD_DISK'
  | 'OTHER';

export type DeliverableStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_CLIENT'
  | 'READY_FOR_REVIEW'
  | 'REVISION_REQUIRED'
  | 'DELIVERED'
  | 'COMPLETED';

export interface DeliverableResponse {
  id: string;
  projectId: string;
  name: string;
  deliverableType: DeliverableType;
  customDeliverableType?: string;
  status: DeliverableStatus;
  referenceUrl?: string;
  dueDate?: string; // LocalDate as YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type Deliverable = DeliverableResponse;

export interface DeliverableCreateRequest {
  projectId: string;
  name: string;
  deliverableType: DeliverableType;
  customDeliverableType?: string;
  status: DeliverableStatus;
  referenceUrl?: string;
  dueDate?: string; // LocalDate as YYYY-MM-DD
}

export interface DeliverableUpdateRequest {
  projectId: string;
  name: string;
  deliverableType: DeliverableType;
  customDeliverableType?: string;
  status: DeliverableStatus;
  referenceUrl?: string;
  dueDate?: string; // LocalDate as YYYY-MM-DD
}
