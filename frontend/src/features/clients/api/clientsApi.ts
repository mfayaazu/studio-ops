import { ApiClient } from '../../../lib/api-client';
import type { ClientResponse, ClientCreateRequest, ClientUpdateRequest } from '../types';

export const clientsApi = {
  list: (search?: string): Promise<ClientResponse[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return ApiClient.get<ClientResponse[]>(`/api/clients${query}`);
  },
  
  getById: (id: string): Promise<ClientResponse> => {
    return ApiClient.get<ClientResponse>(`/api/clients/${id}`);
  },
  
  create: (data: ClientCreateRequest): Promise<ClientResponse> => {
    return ApiClient.post<ClientResponse>('/api/clients', data);
  },
  
  update: (id: string, data: ClientUpdateRequest): Promise<ClientResponse> => {
    return ApiClient.put<ClientResponse>(`/api/clients/${id}`, data);
  },
  
  delete: (id: string): Promise<void> => {
    return ApiClient.delete<void>(`/api/clients/${id}`);
  },
};
