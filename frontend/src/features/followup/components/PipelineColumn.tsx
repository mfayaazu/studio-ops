import React from 'react';
import type { Lead, LeadStage, FollowUpStep } from '../types';
import { LeadCard } from './LeadCard';
import { formatCurrencyINR } from '../../../lib/formatters';

interface PipelineColumnProps {
  stage: LeadStage;
  leads: Lead[];
  steps?: FollowUpStep[];
  isCompact?: boolean;
  onLeadClick?: (leadId: string) => void;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({ 
  stage, 
  leads, 
  steps = [], 
  isCompact = false, 
  onLeadClick 
}) => {
  const getStageLabel = (stage: LeadStage) => {
    switch (stage) {
      case 'NEW_LEAD':
        return 'New Inquiry';
      case 'QUOTE_SENT':
        return 'Quote Sent';
      case 'WARM':
        return 'Warm Lead';
      case 'NEGOTIATION':
        return 'Negotiation';
      case 'FOLLOW_UP_PENDING':
        return 'Follow-up Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'LOST':
        return 'Lost';
      default:
        return stage;
    }
  };

  const getStageHeaderColor = (stage: LeadStage) => {
    switch (stage) {
      case 'NEW_LEAD':
        return 'border-t-2 border-indigo-400';
      case 'QUOTE_SENT':
        return 'border-t-2 border-sky-400';
      case 'WARM':
        return 'border-t-2 border-violet-400';
      case 'NEGOTIATION':
        return 'border-t-2 border-amber-400';
      case 'FOLLOW_UP_PENDING':
        return 'border-t-2 border-fuchsia-400';
      case 'CONFIRMED':
        return 'border-t-2 border-emerald-400';
      case 'LOST':
        return 'border-t-2 border-rose-400';
      default:
        return '';
    }
  };

  const totalValue = leads.reduce((sum, lead) => sum + (lead.quotationTotal || lead.estimatedValue || 0), 0);

  return (
    <div className={`flex flex-col w-64 bg-[#090f1e]/40 border border-slate-800/80 rounded-xl p-2 space-y-2 max-h-[76vh] ${getStageHeaderColor(stage)}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/30">
        <div>
          <h3 className="font-bold text-slate-300 text-[10px] tracking-wider uppercase">
            {getStageLabel(stage)}
          </h3>
          <span className="text-[9px] text-slate-500 font-mono font-semibold block">
            {formatCurrencyINR(totalValue)}
          </span>
        </div>
        <span className="h-4 min-w-4 px-1 flex items-center justify-center rounded bg-slate-800 text-slate-400 text-[9px] font-bold font-mono">
          {leads.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin scrollbar-thumb-slate-800">
        {leads.length === 0 ? (
          <div className="border border-dashed border-slate-800/30 rounded-lg py-5 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] text-slate-650 font-semibold tracking-wide">Empty Stage</span>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              steps={steps}
              isCompact={isCompact}
              onClick={() => onLeadClick && onLeadClick(lead.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
