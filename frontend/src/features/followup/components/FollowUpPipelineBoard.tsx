import React from 'react';
import type { Lead, LeadStage } from '../types';
import { PipelineColumn } from './PipelineColumn';

interface FollowUpPipelineBoardProps {
  leads: Lead[];
}

export const FollowUpPipelineBoard: React.FC<FollowUpPipelineBoardProps> = ({ leads }) => {
  const stages: LeadStage[] = [
    'NEW_LEAD',
    'QUOTE_SENT',
    'WARM',
    'NEGOTIATION',
    'FOLLOW_UP_PENDING',
    'CONFIRMED',
    'LOST'
  ];

  return (
    <div className="bg-[#0b1222]/50 border border-slate-800/60 rounded-2xl p-4 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Booking & Follow-up Funnel
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Track leads from initial quotation sent to deposit paid confirmation
          </p>
        </div>
      </div>

      {/* Horizontally scrolling columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-900/50">
        {stages.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage);
          return (
            <PipelineColumn
              key={stage}
              stage={stage}
              leads={stageLeads}
            />
          );
        })}
      </div>
    </div>
  );
};
