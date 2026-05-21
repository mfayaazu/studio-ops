import { ApiClient } from '../../../lib/api-client';
import type { Client, ClientCreateRequest, ClientUpdateRequest } from '../types';

export const fetchClients = (search?: string): Promise<Client[]> => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return ApiClient.get<Client[]>(`/api/clients${query}`);
};

export const createClient = (data: ClientCreateRequest): Promise<Client> => {
  return ApiClient.post<Client>('/api/clients', data);
};

export const updateClient = (id: string, data: ClientUpdateRequest): Promise<Client> => {
  return ApiClient.put<Client>(`/api/clients/${id}`, data);
};

export const deleteClient = (id: string): Promise<void> => {
  return ApiClient.delete<void>(`/api/clients/${id}`);
};

// Backward compatible object wrapper if referenced elsewhere
export const clientsApi = {
  list: fetchClients,
  getById: (id: string): Promise<Client> => {
    return ApiClient.get<Client>(`/api/clients/${id}`);
  },
  create: createClient,
  update: updateClient,
  delete: deleteClient,
};
