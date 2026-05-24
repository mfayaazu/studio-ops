import React from 'react';
import type { Lead } from '../types';
import { Mail, MessageSquare, Phone, Smartphone, Clock } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
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

  const getUrgencyText = (days: number) => {
    if (days === 99) return 'Confirmed';
    if (days < 0) return `${Math.abs(days)}d Overdue`;
    if (days === 0) return 'Due Today';
    return `${days}d Remaining`;
  };

  const getUrgencyColor = (days: number) => {
    if (days === 99) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (days < 0) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (days === 0) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-slate-800 text-slate-400 border-slate-700/50';
  };

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
        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wide uppercase ${getPriorityColor(lead.priority)}`}>
          {lead.priority}
        </span>
      </div>

      {/* Mid Info Row */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-2">
        <span className="font-mono text-slate-350 font-semibold">${lead.estimatedValue.toLocaleString()}</span>
        <span className="text-[10px] text-slate-500">{lead.eventDate}</span>
      </div>

      {/* Bottom Status Row */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-805 pt-2">
        <div className="flex items-center gap-1.5 text-[9px] bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded text-slate-350 font-semibold">
          {getChannelIcon(lead.channel)}
          <span className="font-mono">{lead.channel}</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold ${getUrgencyColor(lead.urgencyDays)}`}>
          {lead.urgencyDays < 99 && <Clock className="h-2.5 w-2.5" />}
          <span>{getUrgencyText(lead.urgencyDays)}</span>
        </div>
      </div>
    </div>
  );
};
