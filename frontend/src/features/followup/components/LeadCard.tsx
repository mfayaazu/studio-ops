import React from 'react';
import type { Lead, FollowUpStep, LeadPriority } from '../types';
import { Mail, MessageSquare, Phone, Smartphone, Clock } from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/formatters';

interface LeadCardProps {
  lead: Lead;
  steps?: FollowUpStep[];
  isCompact?: boolean;
  onClick?: () => void;
}

export const getCalculatedUrgency = (lead: Lead, steps: FollowUpStep[] = []): LeadPriority => {
  // Manual priority override must take precedence over calculated urgency.
  if (lead.priority === 'URGENT' || lead.priority === 'HIGH') {
    return lead.priority;
  }

  if (lead.stage === 'CONFIRMED' || lead.stage === 'LOST' || !lead.nextFollowUpAt) {
    return lead.priority || 'NORMAL';
  }

  // Find corresponding sequence step
  const activeStep = steps.find(s => s.triggerStage === lead.stage && s.active);
  const thresholdHours = activeStep?.urgencyThresholdHours ?? 24;

  const dueTime = new Date(lead.nextFollowUpAt).getTime();
  const now = new Date().getTime();
  const diffHours = (now - dueTime) / (1000 * 60 * 60);

  if (diffHours > thresholdHours) {
    return 'URGENT';
  } else if (diffHours > 0) {
    return 'HIGH';
  } else if (diffHours > -12) {
    // Due within 12 hours
    return 'NORMAL';
  }
  return 'LOW';
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead, steps = [], isCompact = false, onClick }) => {
  const urgency = getCalculatedUrgency(lead, steps);

  const getPriorityColor = (priority: LeadPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'NORMAL':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'LOW':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getUrgencyColor = (urgencyLevel: LeadPriority) => {
    switch (urgencyLevel) {
      case 'URGENT':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'NORMAL':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700/50';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="h-3 w-3" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-3 w-3" />;
      case 'SMS':
        return <Smartphone className="h-3 w-3" />;
      case 'MANUAL_CALL':
        return <Phone className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getUrgencyText = (_urgencyLevel: LeadPriority) => {
    if (lead.stage === 'CONFIRMED') return 'Confirmed';
    if (lead.stage === 'LOST') return 'Archived';
    
    if (!lead.nextFollowUpAt) return 'No Follow-up Scheduled';

    const dueTime = new Date(lead.nextFollowUpAt).getTime();
    const now = new Date().getTime();
    const diffHours = (now - dueTime) / (1000 * 60 * 60);

    if (diffHours > 0) {
      const days = Math.floor(diffHours / 24);
      const hours = Math.floor(diffHours % 24);
      return days > 0 ? `${days}d ${hours}h Overdue` : `${hours}h Overdue`;
    } else {
      const absDiff = Math.abs(diffHours);
      const days = Math.floor(absDiff / 24);
      const hours = Math.ceil(absDiff % 24);
      return days > 0 ? `${days}d ${hours}h Remaining` : `${hours}h Remaining`;
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'NEW_LEAD': return 'New Inquiry';
      case 'QUOTE_SENT': return 'Quote Sent';
      case 'WARM': return 'Warm Lead';
      case 'NEGOTIATION': return 'Negotiation';
      case 'FOLLOW_UP_PENDING': return 'Follow-up Pending';
      case 'CONFIRMED': return 'Confirmed';
      case 'LOST': return 'Lost';
      default: return stage;
    }
  };

  const getStageBadgeClass = (stage: string) => {
    switch (stage) {
      case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'LOST': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-800 text-slate-300 border-slate-700/50';
    }
  };

  // 1. Compact card view layout
  if (isCompact) {
    return (
      <div
        onClick={onClick}
        className="bg-[#0f172a]/90 hover:bg-[#121c35] border border-slate-850 hover:border-slate-700/80 rounded-lg p-2.5 transition-all duration-200 shadow-sm group cursor-pointer select-none space-y-1.5"
      >
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-200 text-[11px] group-hover:text-violet-400 transition-colors truncate">
              {lead.clientName}
            </h4>
          </div>
          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${getPriorityColor(lead.priority)}`}>
            {lead.priority}
          </span>
        </div>

        <div className="flex items-center justify-between text-[9px] text-slate-400">
          <span className="font-mono text-slate-350">
            {formatCurrencyINR(lead.quotationTotal || lead.estimatedValue)}
          </span>
          <span className={`px-1 py-0.2 rounded border text-[8px] font-bold ${getUrgencyColor(urgency)}`}>
            {getUrgencyText(urgency)}
          </span>
        </div>
      </div>
    );
  }

  // 2. Standard card view layout
  return (
    <div
      onClick={onClick}
      className="bg-[#0f172a]/90 hover:bg-[#121c35] border border-slate-850 hover:border-slate-700/80 rounded-xl p-3.5 transition-all duration-200 shadow-md hover:shadow-lg group space-y-3 cursor-pointer select-none"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-bold text-slate-200 text-xs group-hover:text-violet-400 transition-colors truncate">
            {lead.clientName}
          </h4>
          <p className="text-slate-400 text-[11px] truncate font-medium mt-0.5">
            {lead.projectTitle}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wide uppercase ${getPriorityColor(lead.priority)}`}>
            {lead.priority}
          </span>
        </div>
      </div>

      {/* Stage Badge & Value Row */}
      <div className="flex items-center justify-between text-[11px] text-slate-450 border-t border-slate-800/40 pt-2">
        <span className={`px-2 py-0.5 rounded border text-[9px] font-semibold ${getStageBadgeClass(lead.stage)}`}>
          {getStageLabel(lead.stage)}
        </span>
        <span className="font-mono text-slate-350 font-semibold">
          {formatCurrencyINR(lead.quotationTotal || lead.estimatedValue)}
        </span>
      </div>

      {/* Bottom Status Row */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-805 pt-2">
        <div className="flex items-center gap-1.5 text-[9px] bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded text-slate-350 font-semibold">
          {getChannelIcon(lead.channel)}
          <span className="font-mono">{lead.channel}</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold ${getUrgencyColor(urgency)}`}>
          {lead.stage !== 'CONFIRMED' && lead.stage !== 'LOST' && <Clock className="h-2.5 w-2.5" />}
          <span>{getUrgencyText(urgency)}</span>
        </div>
      </div>
    </div>
  );
};
