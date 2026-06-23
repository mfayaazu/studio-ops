export type ProjectStatus =
  | 'LEAD'
  | 'CONFIRMED'
  | 'SCHEDULED'
  | 'SHOOT_COMPLETED'
  | 'POST_PRODUCTION'
  | 'DELIVERED'
  | 'ARCHIVED'
  | 'CANCELLED';

export type BookingStatus =
  | 'INQUIRY'
  | 'QUOTED'
  | 'CONTRACT_SIGNED'
  | 'DEPOSIT_PAID'
  | 'FULLY_BOOKED';

export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'FULLY_PAID'
  | 'REFUNDED';

export interface ProjectResponse {
  id: string;
  clientId: string;
  assignedProjectManagerId?: string;
  projectCode: string;
  title: string;
  projectType: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  status: ProjectStatus;
  startDate?: string; // LocalDate as YYYY-MM-DD
  endDate?: string;   // LocalDate as YYYY-MM-DD
  notes?: string;
  projectSubtype?: string;
  projectEvents?: string;
  projectBudget?: number;
  amountPaid?: number;
  shootLocation?: string;
  googleMapsLink?: string;
  shootDate?: string;
  shootStartTime?: string;
  shootEndTime?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VIP';
  leadSource?: string;
  createdAt: string;
  updatedAt: string;
}

export type Project = ProjectResponse;

export interface ProjectCreateRequest {
  clientId: string;
  assignedProjectManagerId?: string;
  projectCode: string;
  title: string;
  projectType: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  notes?: string;
  projectSubtype?: string;
  projectEvents?: string;
  projectBudget?: number;
  amountPaid?: number;
  shootLocation?: string;
  googleMapsLink?: string;
  shootDate?: string;
  shootStartTime?: string;
  shootEndTime?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VIP';
  leadSource?: string;
  defaultDeliverables?: string[];
}

export interface ProjectUpdateRequest {
  clientId: string;
  assignedProjectManagerId?: string;
  projectCode: string;
  title: string;
  projectType: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  notes?: string;
  projectSubtype?: string;
  projectEvents?: string;
  projectBudget?: number;
  amountPaid?: number;
  shootLocation?: string;
  googleMapsLink?: string;
  shootDate?: string;
  shootStartTime?: string;
  shootEndTime?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VIP';
  leadSource?: string;
}
