import { ApiClient } from '../../../lib/api-client';
import type { EventResponse, EventCreateRequest, EventUpdateRequest } from '../types';

export const fetchEvents = (search?: string, fromDate?: string, toDate?: string): Promise<EventResponse[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return ApiClient.get<EventResponse[]>(`/api/events${query}`);
};

export const fetchEventById = (id: string): Promise<EventResponse> => {
  return ApiClient.get<EventResponse>(`/api/events/${id}`);
};

export const fetchEventsByProject = (projectId: string): Promise<EventResponse[]> => {
  return ApiClient.get<EventResponse[]>(`/api/projects/${projectId}/events`);
};

export const createEvent = (data: EventCreateRequest): Promise<EventResponse> => {
  return ApiClient.post<EventResponse>('/api/events', data);
};

export const updateEvent = (id: string, data: EventUpdateRequest): Promise<EventResponse> => {
  return ApiClient.put<EventResponse>(`/api/events/${id}`, data);
};

export const deleteEvent = (id: string): Promise<void> => {
  return ApiClient.delete<void>(`/api/events/${id}`);
};

export const eventsApi = {
  list: fetchEvents,
  getById: fetchEventById,
  getByProjectId: fetchEventsByProject,
  create: createEvent,
  update: updateEvent,
  delete: deleteEvent,
};

