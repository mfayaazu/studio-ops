import React from 'react';
import type { Quotation } from '../types';
import type { ClientResponse } from '../../clients/types';
import type { ProjectResponse } from '../../projects/types';
import type { LeadResponse } from '../../followup/types';
import { QuotationStatusBadge } from './QuotationStatusBadge';
import { formatCurrencyINR } from '../../../lib/formatters';
import { Calendar, Briefcase, Users, FileText, ArrowUpRight } from 'lucide-react';

interface QuotationListProps {
  quotations: Quotation[];
  clients: ClientResponse[];
  projects: ProjectResponse[];
  leads: LeadResponse[];
  onEdit: (quotation: Quotation) => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({
  quotations,
  clients,
  projects,
  leads,
  onEdit,
}) => {
  if (quotations.length === 0) {
    return (
      <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-slate-800/30 flex items-center justify-center border border-slate-850">
          <FileText className="h-6 w-6 text-slate-500" />
        </div>
        <div className="space-y-1">
          <p className="text-slate-200 text-sm font-semibold">No quotations yet.</p>
          <p className="text-slate-500 text-xs max-w-sm">Create a new quotation to estimate services and packages for your clients.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quotations.map((q) => {
        const client = clients.find((c) => c.id === q.clientId);
        const project = projects.find((p) => p.id === q.projectId);
        const lead = leads.find((l) => l.id === q.leadId);

        return (
          <div
            key={q.id}
            onClick={() => onEdit(q)}
            className="group bg-[#0d1424] border border-slate-800/80 hover:border-violet-500/50 hover:bg-[#121b2f] rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden"
          >
            {/* Background glow hover animation */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-violet-600/10 to-fuchsia-500/0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-violet-400 font-mono tracking-wider block">
                    {q.quotationNumber}
                  </span>
                  <h3 className="text-slate-100 font-semibold text-sm group-hover:text-white transition-colors line-clamp-1">
                    {q.title}
                  </h3>
                </div>
                <QuotationStatusBadge status={q.status} />
              </div>

              {q.description && (
                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                  {q.description}
                </p>
              )}
            </div>

            {/* Context/Relation references */}
            {(client || lead || project) && (
              <div className="border-t border-slate-850 pt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
                {client && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Users className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{client.fullName}</span>
                  </div>
                )}
                {lead && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{lead.clientName} ({lead.eventType})</span>
                  </div>
                )}
                {project && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Briefcase className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{project.projectCode}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer Summary / Amount */}
            <div className="border-t border-slate-850 pt-3 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Amount</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  {formatCurrencyINR(q.totalAmount)}
                </span>
              </div>

              {q.validUntil ? (
                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Valid Until</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-350 font-medium">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span>{q.validUntil}</span>
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-slate-600 italic">No validity date</span>
              )}
            </div>

            {/* Micro action hint */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-4 w-4 text-violet-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
