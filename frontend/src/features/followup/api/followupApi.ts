import { ApiClient } from '../../../lib/api-client';
import type { 
  MessageTemplate, 
  FollowUpSequence, 
  FollowUpStep, 
  FollowUpTask, 
  FollowUpTaskStatus, 
  CommunicationLog,
  LeadResponse,
  LeadMoveStageRequest
} from '../types';

export const fetchMessageTemplates = async (): Promise<MessageTemplate[]> => {
  return ApiClient.get<MessageTemplate[]>('/api/message-templates');
};

export const fetchFollowUpSequences = async (): Promise<FollowUpSequence[]> => {
  return ApiClient.get<FollowUpSequence[]>('/api/follow-up-sequences');
};

export const fetchFollowUpSteps = async (sequenceId: string): Promise<FollowUpStep[]> => {
  return ApiClient.get<FollowUpStep[]>(`/api/follow-up-sequences/${sequenceId}/steps`);
};

export const fetchDueFollowUpTasks = async (): Promise<FollowUpTask[]> => {
  return ApiClient.get<FollowUpTask[]>('/api/follow-up-tasks/due');
};

export const fetchFollowUpTasks = async (status?: FollowUpTaskStatus): Promise<FollowUpTask[]> => {
  const url = status ? `/api/follow-up-tasks?status=${status}` : '/api/follow-up-tasks';
  return ApiClient.get<FollowUpTask[]>(url);
};

export const approveFollowUpTask = async (id: string): Promise<FollowUpTask> => {
  return ApiClient.post<FollowUpTask>(`/api/follow-up-tasks/${id}/approve`, {});
};

export const skipFollowUpTask = async (id: string): Promise<FollowUpTask> => {
  return ApiClient.post<FollowUpTask>(`/api/follow-up-tasks/${id}/skip`, {});
};

export const cancelFollowUpTask = async (id: string): Promise<FollowUpTask> => {
  return ApiClient.post<FollowUpTask>(`/api/follow-up-tasks/${id}/cancel`, {});
};

export const fetchCommunicationLogs = async (params?: { 
  projectId?: string; 
  clientId?: string; 
  taskId?: string; 
}): Promise<CommunicationLog[]> => {
  let url = '/api/communication-logs';
  const queryParts: string[] = [];
  if (params) {
    if (params.projectId) queryParts.push(`projectId=${params.projectId}`);
    if (params.clientId) queryParts.push(`clientId=${params.clientId}`);
    if (params.taskId) queryParts.push(`taskId=${params.taskId}`);
  }
  if (queryParts.length > 0) {
    url += `?${queryParts.join('&')}`;
  }
  return ApiClient.get<CommunicationLog[]>(url);
};

export const fetchLeads = async (params?: {
  search?: string;
  pipelineStage?: string;
  leadSource?: string;
}): Promise<LeadResponse[]> => {
  let url = '/api/leads';
  const queryParts: string[] = [];
  if (params) {
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.pipelineStage) queryParts.push(`pipelineStage=${params.pipelineStage}`);
    if (params.leadSource) queryParts.push(`leadSource=${params.leadSource}`);
  }
  if (queryParts.length > 0) {
    url += `?${queryParts.join('&')}`;
  }
  return ApiClient.get<LeadResponse[]>(url);
};

export const fetchLead = async (id: string): Promise<LeadResponse> => {
  return ApiClient.get<LeadResponse>(`/api/leads/${id}`);
};

export const moveLeadStage = async (id: string, payload: LeadMoveStageRequest): Promise<LeadResponse> => {
  return ApiClient.post<LeadResponse>(`/api/leads/${id}/move-stage`, payload);
};
