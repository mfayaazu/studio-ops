import { ApiClient } from '../../../lib/api-client';
import type { DashboardSummaryResponse } from '../types';

export const dashboardApi = {
  getSummary: (): Promise<DashboardSummaryResponse> => {
    return ApiClient.get<DashboardSummaryResponse>('/api/dashboard/summary');
  },
};
