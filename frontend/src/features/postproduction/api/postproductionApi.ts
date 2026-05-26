import { ApiClient } from '../../../lib/api-client';
import type {
  PostProductionTask,
  PostProductionTaskStatus,
  PostProductionSubtask,
  PostProductionSubtaskStatus,
  PostProductionTaskUpdateRequest
} from '../types';

export const fetchPostProductionTasks = (params?: {
  projectId?: string;
  deliverableId?: string;
  status?: PostProductionTaskStatus;
  assignedEmployeeId?: string;
  dueBefore?: string;
  search?: string;
}): Promise<PostProductionTask[]> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        queryParams.append(key, val);
      }
    });
  }
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return ApiClient.get<PostProductionTask[]>(`/api/post-production-tasks${queryStr}`);
};

export const movePostProductionTaskStatus = (
  id: string,
  status: PostProductionTaskStatus
): Promise<PostProductionTask> => {
  return ApiClient.post<PostProductionTask>(`/api/post-production-tasks/${id}/move-status`, { status });
};

export const fetchPostProductionSubtasks = (taskId: string): Promise<PostProductionSubtask[]> => {
  return ApiClient.get<PostProductionSubtask[]>(
    `/api/post-production-subtasks?taskId=${encodeURIComponent(taskId)}`
  );
};

export const movePostProductionSubtaskStatus = (
  id: string,
  status: PostProductionSubtaskStatus
): Promise<PostProductionSubtask> => {
  return ApiClient.post<PostProductionSubtask>(
    `/api/post-production-subtasks/${id}/move-status`,
    { status }
  );
};

export const updatePostProductionTask = (
  id: string,
  payload: PostProductionTaskUpdateRequest
): Promise<PostProductionTask> => {
  return ApiClient.put<PostProductionTask>(`/api/post-production-tasks/${id}`, payload);
};

export const postproductionApi = {
  fetchTasks: fetchPostProductionTasks,
  moveTaskStatus: movePostProductionTaskStatus,
  fetchSubtasks: fetchPostProductionSubtasks,
  moveSubtaskStatus: movePostProductionSubtaskStatus,
  updateTask: updatePostProductionTask
};
