import React from 'react';
import type { MessageTemplate } from '../types';
import { Mail, MessageSquare, Phone, Smartphone, Eye, Check } from 'lucide-react';

interface TemplateCardGridProps {
  templates: MessageTemplate[];
}

export const TemplateCardGrid: React.FC<TemplateCardGridProps> = ({ templates }) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="h-3.5 w-3.5" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-3.5 w-3.5" />;
      case 'SMS':
        return <Smartphone className="h-3.5 w-3.5" />;
      case 'MANUAL_CALL':
        return <Phone className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case 'QUOTE_SENT':
        return 'Quote Sent';
      case 'SOFT_FOLLOW_UP':
        return 'Soft Follow-up';
      case 'VALUE_FOLLOW_UP':
        return 'Value Follow-up';
      case 'SCARCITY_FOLLOW_UP':
        return 'Scarcity Follow-up';
      case 'FINAL_FOLLOW_UP':
        return 'Final Closure';
      default:
        return type;
    }
  };

  return (
    <div className="bg-[#0b1222]/50 border border-slate-800/60 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Saved Communication Templates
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-defined templates with custom placeholders used across sequence steps
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-[#0f172a]/95 border border-slate-850 hover:border-slate-700/80 rounded-xl p-5 space-y-4 shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header: Name & Channel */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-250 truncate mr-2">
                  {template.name}
                </span>
                <span className="flex items-center gap-1 text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold font-mono">
                  {getChannelIcon(template.channel)}
                  <span>{template.channel}</span>
                </span>
              </div>

              {/* Sub-header: Type */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-wide">
                <span>Type: {getTemplateTypeLabel(template.templateType)}</span>
                {template.active && (
                  <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                    <Check className="h-3 w-3" /> Active
                  </span>
                )}
              </div>

              {/* Subject if Email */}
              {template.subject && (
                <div className="bg-slate-900/50 border border-slate-800/40 p-2.5 rounded-lg text-xs">
                  <span className="text-slate-500 font-semibold font-mono block text-[9px] uppercase tracking-wide mb-0.5">Subject:</span>
                  <span className="text-slate-350 truncate block font-medium">{template.subject}</span>
                </div>
              )}

              {/* Body Preview */}
              <div className="bg-slate-900/30 border border-slate-800/30 p-3 rounded-lg text-xs text-slate-400 font-medium">
                <span className="text-slate-500 font-semibold font-mono block text-[9px] uppercase tracking-wide mb-1">Body Preview:</span>
                <p className="whitespace-pre-line line-clamp-4 font-sans leading-relaxed">
                  {template.body}
                </p>
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-900/60 mt-2 text-[10px]">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/60 text-slate-300 font-semibold transition-colors">
                <Eye className="h-3 w-3" />
                <span>Preview Template</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
