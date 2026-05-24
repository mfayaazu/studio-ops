import React from 'react';
import type { SequenceStep } from '../types';
import { Mail, MessageSquare, Phone, Smartphone, Check, Clock, ChevronRight } from 'lucide-react';

interface FollowUpTimelineProps {
  steps: SequenceStep[];
}

export const FollowUpTimeline: React.FC<FollowUpTimelineProps> = ({ steps }) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-4 w-4" />;
      case 'SMS':
        return <Smartphone className="h-4 w-4" />;
      case 'MANUAL_CALL':
        return <Phone className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case 'QUOTE_SENT':
        return 'Initial Quotation Dispatch';
      case 'SOFT_FOLLOW_UP':
        return 'Soft Check-in Message';
      case 'VALUE_FOLLOW_UP':
        return 'Value Guide & Tips';
      case 'SCARCITY_FOLLOW_UP':
        return 'Urgency & Scarcity Warning';
      case 'FINAL_FOLLOW_UP':
        return 'Polite Final Closure';
      default:
        return type;
    }
  };

  return (
    <div className="bg-[#0b1222]/50 border border-slate-800/60 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">
          Default 10-Day Follow-up Timeline
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Automatic communication sequence triggered when a project quotation is sent
        </p>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800/50 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col bg-[#0f172a]/95 border rounded-xl p-5 space-y-4 shadow-md transition-all duration-300 ${
                step.active 
                  ? 'border-slate-800 hover:border-violet-500/40 hover:shadow-violet-500/5' 
                  : 'border-slate-900 opacity-60'
              }`}
            >
              {/* Top Row: Day Offset */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/15">
                  Day {step.delayDays} {step.delayDays === 0 ? '(Immediate)' : ''}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block h-4 w-4 text-slate-600" />
                )}
              </div>

              {/* Step info */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  <span className="text-slate-500">{getChannelIcon(step.channel)}</span>
                  <span>{step.channel}</span>
                </div>
                <h4 className="text-[11px] font-mono text-slate-500 mt-1 uppercase tracking-wide">
                  {getTemplateTypeLabel(step.templateType)}
                </h4>
              </div>

              {/* Goal & Description */}
              <p className="text-xs text-slate-400 font-medium line-clamp-2">
                {step.goal}
              </p>

              {/* Active Badge */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-900/60 text-[10px] font-semibold text-slate-500">
                <span>Status:</span>
                <span className={`flex items-center gap-1 font-bold ${step.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {step.active ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {step.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
