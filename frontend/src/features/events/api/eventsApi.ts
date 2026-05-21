import { ApiClient } from '../../../lib/api-client';
import type { EventResponse, EventCreateRequest, EventUpdateRequest } from '../types';

export const eventsApi = {
  list: (search?: string, fromDate?: string, toDate?: string): Promise<EventResponse[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get<EventResponse[]>(`/api/events${query}`);
  },
  
  getById: (id: string): Promise<EventResponse> => {
    return ApiClient.get<EventResponse>(`/api/events/${id}`);
  },
  
  getByProjectId: (projectId: string): Promise<EventResponse[]> => {
    return ApiClient.get<EventResponse[]>(`/api/projects/${projectId}/events`);
  },
  
  create: (data: EventCreateRequest): Promise<EventResponse> => {
    return ApiClient.post<EventResponse>('/api/events', data);
  },
  
  update: (id: string, data: EventUpdateRequest): Promise<EventResponse> => {
    return ApiClient.put<EventResponse>(`/api/events/${id}`, data);
  },
  
  delete: (id: string): Promise<void> => {
    return ApiClient.delete<void>(`/api/events/${id}`);
  },
};
