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
