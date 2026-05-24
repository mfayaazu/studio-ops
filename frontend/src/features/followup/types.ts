export type ChannelType = 'EMAIL' | 'WHATSAPP' | 'SMS' | 'MANUAL_CALL';

export type TemplateType = 'QUOTE_SENT' | 'SOFT_FOLLOW_UP' | 'VALUE_FOLLOW_UP' | 'SCARCITY_FOLLOW_UP' | 'FINAL_FOLLOW_UP' | 'CUSTOM';

export type LeadStage = 'NEW_LEAD' | 'QUOTE_SENT' | 'WARM' | 'NEGOTIATION' | 'FOLLOW_UP_PENDING' | 'CONFIRMED' | 'LOST';

export type TaskStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'CANCELLED';

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
  priority: 'low' | 'medium' | 'high';
  urgencyDays: number;
  notes?: string;
  sequenceName?: string;
  history?: Array<{
    date: string;
    event: string;
    status: 'sent' | 'skipped' | 'system';
  }>;
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
}

export type CommunicationDirection = 'OUTBOUND' | 'INBOUND';

export type CommunicationProvider = 'MANUAL_DEMO' | 'SMTP' | 'GMAIL' | 'TWILIO' | 'META_WHATSAPP' | 'OTHER';

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

