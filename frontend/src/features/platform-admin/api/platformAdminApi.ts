import { ApiClient } from '../../../lib/api-client';
import type { 
  PlatformStudioResponse, 
  PerformanceSummary, 
  TopEndpointsResponse, 
  ApiRequestLogResponse 
} from '../types';

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

export async function getPerformanceSummary(): Promise<PerformanceSummary> {
  return ApiClient.get<PerformanceSummary>('/api/platform-admin/performance/summary');
}

export async function getTopEndpoints(): Promise<TopEndpointsResponse> {
  return ApiClient.get<TopEndpointsResponse>('/api/platform-admin/performance/top-endpoints');
}

export async function getRecentErrors(): Promise<ApiRequestLogResponse[]> {
  return ApiClient.get<ApiRequestLogResponse[]>('/api/platform-admin/performance/recent-errors');
}

export async function getRecentSlowRequests(): Promise<ApiRequestLogResponse[]> {
  return ApiClient.get<ApiRequestLogResponse[]>('/api/platform-admin/performance/slow-requests');
}
