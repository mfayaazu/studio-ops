import { ApiClient } from '../../../lib/api-client';
import type { MessageTemplate, FollowUpSequence, FollowUpStep } from '../types';

export const fetchMessageTemplates = async (): Promise<MessageTemplate[]> => {
  return ApiClient.get<MessageTemplate[]>('/api/message-templates');
};

export const fetchFollowUpSequences = async (): Promise<FollowUpSequence[]> => {
  return ApiClient.get<FollowUpSequence[]>('/api/follow-up-sequences');
};

export const fetchFollowUpSteps = async (sequenceId: string): Promise<FollowUpStep[]> => {
  return ApiClient.get<FollowUpStep[]>(`/api/follow-up-sequences/${sequenceId}/steps`);
};
