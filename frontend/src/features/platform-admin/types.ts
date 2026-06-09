export interface PlatformStudioResponse {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL' | 'BETA_ACTIVE';
  subscriptionPlan: 'STARTER' | 'STUDIO' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'SUSPENDED';
  ownerName: string;
  ownerEmail: string;
  phone: string;
  country: string;
  createdAt: string;
}

export interface PerformanceSummary {
  totalRequestsToday: number;
  averageResponseMsToday: number;
  p95ResponseMsToday: number;
  errorCountToday: number;
  slowRequestCountToday: number;
  dbHealth: string;
  lastUpdated: string;
}

export interface EndpointMetric {
  method: string;
  path: string;
  requestCount: number;
  avgDurationMs: number;
}

export interface TopEndpointsResponse {
  byVolume: EndpointMetric[];
  slowest: EndpointMetric[];
}

export interface ApiRequestLogResponse {
  id: string;
  createdAt: string;
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  userEmail: string;
  studioId: string | null;
  remoteIp: string;
  errorMessage: string | null;
}
