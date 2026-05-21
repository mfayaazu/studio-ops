export type EventType =
  | 'WEDDING'
  | 'ENGAGEMENT'
  | 'RECEPTION'
  | 'HALDI'
  | 'MEHENDI'
  | 'SANGEET'
  | 'BIRTHDAY'
  | 'HOUSEWARMING'
  | 'PRE_WEDDING'
  | 'CORPORATE'
  | 'OTHER';

export type EventStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface EventResponse {
  id: string;
  projectId: string;
  title: string;
  type: EventType;
  eventDate: string; // LocalDate as YYYY-MM-DD
  startTime: string; // LocalTime as HH:MM:ss
  endTime: string;   // LocalTime as HH:MM:ss
  venueName: string;
  city: string;
  address: string;
  status: EventStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventCreateRequest {
  projectId: string;
  title: string;
  type: EventType;
  eventDate: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  venueName: string;
  city: string;
  address: string;
  status: EventStatus;
  notes?: string;
}

export interface EventUpdateRequest {
  projectId: string;
  title: string;
  type: EventType;
  eventDate: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  venueName: string;
  city: string;
  address: string;
  status: EventStatus;
  notes?: string;
}
