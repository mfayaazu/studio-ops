import React from 'react';
import type { Lead, LeadStage } from '../types';
import { LeadCard } from './LeadCard';
import { formatCurrencyINR } from '../../../lib/formatters';

interface PipelineColumnProps {
  stage: LeadStage;
  leads: Lead[];
  onLeadClick?: (leadId: string) => void;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({ stage, leads, onLeadClick }) => {
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

  const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);

  return (
    <div className={`flex flex-col w-72 bg-[#090f1e]/40 border border-slate-800/80 rounded-xl p-3.5 space-y-4 max-h-[70vh] ${getStageHeaderColor(stage)}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-200 text-xs tracking-wider uppercase">
            {getStageLabel(stage)}
          </h3>
          <span className="text-[10px] text-slate-500 font-mono font-semibold mt-0.5 block">
            {formatCurrencyINR(totalValue)} Value
          </span>
        </div>
        <span className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold font-mono">
          {leads.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {leads.length === 0 ? (
          <div className="border border-dashed border-slate-800/50 rounded-xl py-8 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-600 font-semibold tracking-wide">No Leads in Stage</span>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick && onLeadClick(lead.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
