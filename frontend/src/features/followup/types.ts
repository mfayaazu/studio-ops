export type ChannelType = 'EMAIL' | 'WHATSAPP' | 'SMS' | 'MANUAL_CALL';

export type TemplateType = 'QUOTE_SENT' | 'SOFT_FOLLOW_UP' | 'VALUE_FOLLOW_UP' | 'SCARCITY_FOLLOW_UP' | 'FINAL_FOLLOW_UP' | 'CUSTOM';

export type LeadStage = 'NEW_LEAD' | 'QUOTE_SENT' | 'WARM' | 'NEGOTIATION' | 'FOLLOW_UP_PENDING' | 'CONFIRMED' | 'LOST';

export type TaskStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'CANCELLED';

export type LeadPreferredChannel = 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PHONE_CALL' | 'MANUAL';
export type LeadSource = 'WEBSITE' | 'WHATSAPP' | 'INSTAGRAM' | 'REFERRAL' | 'WALK_IN' | 'PHONE_CALL' | 'EMAIL' | 'MANUAL' | 'IMPORT' | 'OTHER';
export type LeadPipelineStage = 'NEW_LEAD' | 'QUOTE_SENT' | 'WARM' | 'NEGOTIATION' | 'FOLLOW_UP_PENDING' | 'CONFIRMED' | 'LOST';
export type LeadLostReason = 'PRICE_TOO_HIGH' | 'BOOKED_COMPETITOR' | 'DATE_UNAVAILABLE' | 'NO_RESPONSE' | 'CLIENT_CANCELLED' | 'OTHER';

export type LeadPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type LeadPaymentStatus = 'UNPAID' | 'ADVANCE_PAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';

export interface LeadEventSegment {
  id?: string;
  eventType: string;
  eventName: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  venueName?: string;
  address?: string;
  city?: string;
  notes?: string;
}

export interface LeadEventSegmentRequest {
  eventType: string;
  eventName: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  venueName?: string;
  address?: string;
  city?: string;
  notes?: string;
}

export interface LeadResponse {
  id: string;
  studioId: string;
  clientId?: string;
  projectId?: string;
  clientName: string;
  phone?: string;
  email?: string;
  preferredChannel: LeadPreferredChannel;
  eventType?: string;
  eventDate?: string;
  city?: string;
  estimatedValue?: number;
  leadSource: LeadSource;
  pipelineStage: LeadPipelineStage;
  assignedUserId?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  notes?: string;
  lostReason?: LeadLostReason;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  // CRM Enhancements
  priority: LeadPriority;
  paymentStatus: LeadPaymentStatus;
  quotationTotal: number;
  amountPaid: number;
  amountRemaining: number;
  eventSegments: LeadEventSegment[];
}

export interface LeadMoveStageRequest {
  pipelineStage: LeadPipelineStage;
  lostReason?: LeadLostReason;
  notes?: string;
}

export interface Lead {
  id: string;
  clientName: string;
  projectTitle: string;
  estimatedValue: number;
  eventDate: string;
  lastContacted: string;
  nextFollowUp: string;
  channel: ChannelType;
  stage: LeadStage;
  priority: LeadPriority;
  urgencyDays: number;
  notes?: string;
  sequenceName?: string;
  history?: Array<{
    date: string;
    event: string;
    status: 'sent' | 'skipped' | 'system';
  }>;
  // Backend integrations
  phone?: string;
  email?: string;
  city?: string;
  leadSource?: LeadSource;
  lostReason?: LeadLostReason;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  clientId?: string;
  projectId?: string;
  studioId?: string;
  convertedAt?: string;
  // CRM Enhancements
  paymentStatus: LeadPaymentStatus;
  quotationTotal: number;
  amountPaid: number;
  amountRemaining: number;
  eventSegments: LeadEventSegment[];
}

export interface SequenceStep {
  id: string;
  delayDays: number;
  channel: ChannelType;
  templateType: TemplateType;
  goal: string;
  active: boolean;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: ChannelType;
  templateType: TemplateType;
  subject?: string;
  body: string;
  active: boolean;
}

export interface PendingFollowUp {
  id: string;
  leadId: string;
  clientName: string;
  projectTitle: string;
  channel: ChannelType;
  dueDate: string;
  dueStatus: 'due_today' | 'overdue' | 'upcoming';
  subject?: string;
  body: string;
}

export interface FollowUpSequence {
  id: string;
  studioId: string;
  name: string;
  description?: string;
  active: boolean;
  applicableStage?: LeadPipelineStage;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowUpStep {
  id: string;
  studioId: string;
  sequenceId: string;
  stepOrder: number;
  delayDays: number;
  channel: ChannelType;
  templateId: string;
  goal: string;
  active: boolean;
  stepName?: string;
  triggerStage?: LeadPipelineStage;
  delayValue: number;
  delayUnit: string; // 'MINUTES' | 'HOURS' | 'DAYS'
  defaultPriority: LeadPriority;
  urgencyThresholdHours?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type FollowUpTaskStatus = 'PENDING_APPROVAL' | 'SCHEDULED' | 'SENT' | 'FAILED' | 'SKIPPED' | 'CANCELLED';

export interface FollowUpTask {
  id: string;
  studioId: string;
  projectId?: string;
  clientId?: string;
  sequenceId?: string;
  stepId?: string;
  templateId?: string;
  channel: ChannelType;
  scheduledAt: string;
  status: FollowUpTaskStatus;
  recipient?: string;
  subject?: string;
  messageBody: string;
  approvedByUserId?: string;
  sentAt?: string;
  skippedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  // CRM Enhancements
  isDraft: boolean;
  draftMessage?: string;
  priority: LeadPriority;
}

export type CommunicationDirection = 'OUTBOUND' | 'INBOUND';

export type CommunicationProvider = 'MANUAL_DEMO' | 'MANUAL_WHATSAPP' | 'SMTP' | 'GMAIL' | 'TWILIO' | 'META_WHATSAPP' | 'OTHER';

export type CommunicationLogStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'SKIPPED' | 'CANCELLED';

export interface CommunicationLog {
  id: string;
  studioId: string;
  projectId?: string;
  clientId?: string;
  followUpTaskId?: string;
  channel: ChannelType;
  direction: CommunicationDirection;
  recipient?: string;
  subject?: string;
  messageBody?: string;
  provider?: CommunicationProvider;
  providerMessageId?: string;
  status: CommunicationLogStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface LeadCreateRequest {
  clientId?: string;
  projectId?: string;
  clientName: string;
  phone?: string;
  email?: string;
  preferredChannel: LeadPreferredChannel;
  eventType?: string;
  eventDate?: string;
  city?: string;
  estimatedValue?: number;
  leadSource: LeadSource;
  pipelineStage?: LeadPipelineStage;
  assignedUserId?: string;
  nextFollowUpAt?: string;
  notes?: string;
  studioId?: string;
  // CRM Enhancements
  priority?: LeadPriority;
  paymentStatus?: LeadPaymentStatus;
  quotationTotal?: number;
  amountPaid?: number;
  eventSegments?: LeadEventSegmentRequest[];
}

export interface LeadUpdateRequest {
  clientName: string;
  phone?: string;
  email?: string;
  preferredChannel: LeadPreferredChannel;
  eventType?: string;
  eventDate?: string;
  city?: string;
  estimatedValue?: number;
  leadSource: LeadSource;
  assignedUserId?: string;
  nextFollowUpAt?: string;
  notes?: string;
  // CRM Enhancements
  priority?: LeadPriority;
  paymentStatus?: LeadPaymentStatus;
  quotationTotal?: number;
  amountPaid?: number;
  eventSegments?: LeadEventSegmentRequest[];
}

export interface LeadConvertToProjectRequest {
  projectCode?: string;
  title?: string;
  projectType?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  status?: string;
  notes?: string;
}

export interface LeadConvertToProjectResponse {
  leadId: string;
  clientId: string;
  projectId: string;
  pipelineStage: LeadPipelineStage;
  convertedAt: string;
  message: string;
}


