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
