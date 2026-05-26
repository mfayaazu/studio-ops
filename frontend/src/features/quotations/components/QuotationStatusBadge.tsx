import React from 'react';
import type { QuotationStatus } from '../types';

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
}

export const QuotationStatusBadge: React.FC<QuotationStatusBadgeProps> = ({ status }) => {
  const getColors = () => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'SENT':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'ACCEPTED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-455 border-rose-500/20';
      case 'EXPIRED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CANCELLED':
        return 'bg-slate-700/10 text-slate-500 border-slate-700/20 line-through';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getColors()}`}>
      {status}
    </span>
  );
};
