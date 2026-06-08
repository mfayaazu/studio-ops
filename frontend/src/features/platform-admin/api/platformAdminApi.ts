import { ApiClient } from '../../../lib/api-client';
import type { PlatformStudioResponse } from '../types';

export async function getStudios(): Promise<PlatformStudioResponse[]> {
  return ApiClient.get<PlatformStudioResponse[]>('/api/platform-admin/studios');
}

export async function getPendingStudios(): Promise<PlatformStudioResponse[]> {
  return ApiClient.get<PlatformStudioResponse[]>('/api/platform-admin/studios/pending');
}

export async function approveStudio(id: string): Promise<PlatformStudioResponse> {
  return ApiClient.post<PlatformStudioResponse>(`/api/platform-admin/studios/${id}/approve`, {});
}

export async function rejectStudio(id: string): Promise<PlatformStudioResponse> {
  return ApiClient.post<PlatformStudioResponse>(`/api/platform-admin/studios/${id}/reject`, {});
}

export async function suspendStudio(id: string): Promise<PlatformStudioResponse> {
  return ApiClient.post<PlatformStudioResponse>(`/api/platform-admin/studios/${id}/suspend`, {});
}
