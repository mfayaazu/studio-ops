import { ApiClient } from '../../../lib/api-client';
import type { Deliverable } from '../types';

export const fetchDeliverables = (projectId?: string): Promise<Deliverable[]> => {
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  return ApiClient.get<Deliverable[]>(`/api/deliverables${query}`);
};

export const deliverablesApi = {
  list: fetchDeliverables,
  getById: (id: string): Promise<Deliverable> => {
    return ApiClient.get<Deliverable>(`/api/deliverables/${id}`);
  },
};
