import { ApiClient } from '../../../lib/api-client';
import type { ProjectResponse, ProjectCreateRequest, ProjectUpdateRequest } from '../types';

export const projectsApi = {
  list: (search?: string): Promise<ProjectResponse[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return ApiClient.get<ProjectResponse[]>(`/api/projects${query}`);
  },
  
  getById: (id: string): Promise<ProjectResponse> => {
    return ApiClient.get<ProjectResponse>(`/api/projects/${id}`);
  },
  
  create: (data: ProjectCreateRequest): Promise<ProjectResponse> => {
    return ApiClient.post<ProjectResponse>('/api/projects', data);
  },
  
  update: (id: string, data: ProjectUpdateRequest): Promise<ProjectResponse> => {
    return ApiClient.put<ProjectResponse>(`/api/projects/${id}`, data);
  },
  
  delete: (id: string): Promise<void> => {
    return ApiClient.delete<void>(`/api/projects/${id}`);
  },
};
