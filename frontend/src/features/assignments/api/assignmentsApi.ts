import { ApiClient } from '../../../lib/api-client';
import type {
  EventAssignment,
  EventAssignmentCreateRequest,
  EventAssignmentUpdateRequest,
} from '../types';

export const fetchAssignments = (params?: { eventId?: string; employeeId?: string }): Promise<EventAssignment[]> => {
  const queryParams = new URLSearchParams();
  if (params?.eventId) {
    queryParams.append('eventId', params.eventId);
  }
  if (params?.employeeId) {
    queryParams.append('employeeId', params.employeeId);
  }
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return ApiClient.get<EventAssignment[]>(`/api/assignments${queryStr}`);
};

export const fetchAssignmentsByEvent = (eventId: string): Promise<EventAssignment[]> => {
  return fetchAssignments({ eventId });
};

export const fetchAssignmentsByEmployee = (employeeId: string): Promise<EventAssignment[]> => {
  return fetchAssignments({ employeeId });
};

export const fetchAssignmentById = (id: string): Promise<EventAssignment> => {
  return ApiClient.get<EventAssignment>(`/api/assignments/${id}`);
};

export const createAssignment = (payload: EventAssignmentCreateRequest): Promise<EventAssignment> => {
  return ApiClient.post<EventAssignment>('/api/assignments', payload);
};

export const updateAssignment = (id: string, payload: EventAssignmentUpdateRequest): Promise<EventAssignment> => {
  return ApiClient.put<EventAssignment>(`/api/assignments/${id}`, payload);
};

export const deleteAssignment = (id: string): Promise<void> => {
  return ApiClient.delete<void>(`/api/assignments/${id}`);
};

export const assignmentsApi = {
  list: fetchAssignments,
  getByEvent: fetchAssignmentsByEvent,
  getByEmployee: fetchAssignmentsByEmployee,
  getById: fetchAssignmentById,
  create: createAssignment,
  update: updateAssignment,
  delete: deleteAssignment,
};
