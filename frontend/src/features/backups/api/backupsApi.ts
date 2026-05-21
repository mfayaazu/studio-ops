import { ApiClient } from '../../../lib/api-client';
import type { BackupRecord, BackupRecordCreateRequest, BackupRecordUpdateRequest } from '../types';

export const fetchBackups = (params?: { projectId?: string; deliverableId?: string }): Promise<BackupRecord[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) {
    queryParams.append('projectId', params.projectId);
  }
  if (params?.deliverableId) {
    queryParams.append('deliverableId', params.deliverableId);
  }
  const queryStr = queryParams.toString();
  const query = queryStr ? `?${queryStr}` : '';
  return ApiClient.get<BackupRecord[]>(`/api/backups${query}`);
};

export const fetchBackupsByProject = (projectId: string): Promise<BackupRecord[]> => {
  return fetchBackups({ projectId });
};

export const fetchBackupsByDeliverable = (deliverableId: string): Promise<BackupRecord[]> => {
  return fetchBackups({ deliverableId });
};

export const fetchBackupById = (id: string): Promise<BackupRecord> => {
  return ApiClient.get<BackupRecord>(`/api/backups/${id}`);
};

export const createBackup = (data: BackupRecordCreateRequest): Promise<BackupRecord> => {
  return ApiClient.post<BackupRecord>('/api/backups', data);
};

export const updateBackup = (id: string, data: BackupRecordUpdateRequest): Promise<BackupRecord> => {
  return ApiClient.put<BackupRecord>(`/api/backups/${id}`, data);
};

export const deleteBackup = (id: string): Promise<void> => {
  return ApiClient.delete<void>(`/api/backups/${id}`);
};

export const backupsApi = {
  list: fetchBackups,
  getByProject: fetchBackupsByProject,
  getByDeliverable: fetchBackupsByDeliverable,
  getById: fetchBackupById,
  create: createBackup,
  update: updateBackup,
  delete: deleteBackup,
};
