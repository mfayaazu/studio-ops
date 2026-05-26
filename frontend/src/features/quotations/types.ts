export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface Quotation {
  id: string;
  studioId: string;
  leadId?: string;
  projectId?: string;
  clientId?: string;
  quotationNumber: string;
  title: string;
  description?: string;
  status: QuotationStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  validUntil?: string; // YYYY-MM-DD
  sentAt?: string;     // ISO string
  acceptedAt?: string; // ISO string
  rejectedAt?: string; // ISO string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationCreateRequest {
  studioId?: string;
  leadId?: string;
  projectId?: string;
  clientId?: string;
  quotationNumber?: string;
  title: string;
  description?: string;
  status?: QuotationStatus;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  currency?: string;
  validUntil?: string;
  notes?: string;
}

export interface QuotationUpdateRequest {
  leadId?: string;
  projectId?: string;
  clientId?: string;
  title: string;
  description?: string;
  status?: QuotationStatus;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  currency?: string;
  validUntil?: string;
  notes?: string;
}

export interface QuotationStatusUpdateRequest {
  status: QuotationStatus;
}
