import { ApiClient } from '../../../lib/api-client';
import type { Project, ProjectCreateRequest, ProjectUpdateRequest } from '../types';

export const fetchProjects = (search?: string): Promise<Project[]> => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return ApiClient.get<Project[]>(`/api/projects${query}`);
};

export const createProject = (data: ProjectCreateRequest): Promise<Project> => {
  return ApiClient.post<Project>('/api/projects', data);
};

export const updateProject = (id: string, data: ProjectUpdateRequest): Promise<Project> => {
  return ApiClient.put<Project>(`/api/projects/${id}`, data);
};

export const deleteProject = (id: string): Promise<void> => {
  return ApiClient.delete<void>(`/api/projects/${id}`);
};

// Backward compatible object wrapper if referenced elsewhere
export const projectsApi = {
  list: fetchProjects,
  getById: (id: string): Promise<Project> => {
    return ApiClient.get<Project>(`/api/projects/${id}`);
  },
  create: createProject,
  update: updateProject,
  delete: deleteProject,
};
