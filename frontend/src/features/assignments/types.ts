export type AssignmentRole =
  | 'TRADITIONAL_PHOTOGRAPHER'
  | 'TRADITIONAL_VIDEOGRAPHER'
  | 'CANDID_PHOTOGRAPHER'
  | 'CINEMATOGRAPHER'
  | 'DRONE_OPERATOR'
  | 'LIGHTING_ASSISTANT'
  | 'ASSISTANT'
  | 'EDITOR'
  | 'OTHER';

export type AssignmentStatus =
  | 'PROPOSED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface EventAssignment {
  id: string;
  eventId: string;
  employeeId: string;
  assignmentRole: AssignmentRole;
  assignmentStatus: AssignmentStatus;
  callTime: string; // HH:mm:ss
  notes?: string;
  conflictWarning: boolean;
  conflictReason?: string;
  conflictMessage?: string; // Safety alias
  createdAt?: string;
  updatedAt?: string;
}

export interface EventAssignmentCreateRequest {
  eventId: string;
  employeeId: string;
  assignmentRole: AssignmentRole;
  assignmentStatus: AssignmentStatus;
  callTime?: string; // HH:mm:ss
  notes?: string;
}

export interface EventAssignmentUpdateRequest {
  eventId: string;
  employeeId: string;
  assignmentRole: AssignmentRole;
  assignmentStatus: AssignmentStatus;
  callTime?: string; // HH:mm:ss
  notes?: string;
}
