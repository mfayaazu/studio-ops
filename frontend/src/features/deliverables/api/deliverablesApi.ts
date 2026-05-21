import { ApiClient } from '../../../lib/api-client';
import type { Deliverable, DeliverableCreateRequest, DeliverableUpdateRequest } from '../types';

export const fetchDeliverables = (params?: { projectId?: string }): Promise<Deliverable[]> => {
  const query = params?.projectId ? `?projectId=${encodeURIComponent(params.projectId)}` : '';
  return ApiClient.get<Deliverable[]>(`/api/deliverables${query}`);
};

export const fetchDeliverablesByProject = (projectId: string): Promise<Deliverable[]> => {
  return fetchDeliverables({ projectId });
};

export const fetchDeliverableById = (id: string): Promise<Deliverable> => {
  return ApiClient.get<Deliverable>(`/api/deliverables/${id}`);
};

export const createDeliverable = (data: DeliverableCreateRequest): Promise<Deliverable> => {
  return ApiClient.post<Deliverable>('/api/deliverables', data);
};

export const updateDeliverable = (id: string, data: DeliverableUpdateRequest): Promise<Deliverable> => {
  return ApiClient.put<Deliverable>(`/api/deliverables/${id}`, data);
};

export const deleteDeliverable = (id: string): Promise<void> => {
  return ApiClient.delete<void>(`/api/deliverables/${id}`);
};

export const deliverablesApi = {
  list: fetchDeliverables,
  getByProject: fetchDeliverablesByProject,
  getById: fetchDeliverableById,
  create: createDeliverable,
  update: updateDeliverable,
  delete: deleteDeliverable,
};
