import React from 'react';
import { ClipboardList, Clock, Users, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Deliverable } from '../types';

interface DeliverableSummaryProps {
  deliverables: Deliverable[];
}

export const DeliverableSummary: React.FC<DeliverableSummaryProps> = ({ deliverables }) => {
  const totalCount = deliverables.length;
  const inProgressCount = deliverables.filter(d => d.status === 'IN_PROGRESS' || d.status === 'REVISION_REQUIRED').length;
  const waitingForClientCount = deliverables.filter(d => d.status === 'WAITING_FOR_CLIENT').length;
  const readyForReviewCount = deliverables.filter(d => d.status === 'READY_FOR_REVIEW').length;
  const completedCount = deliverables.filter(d => d.status === 'DELIVERED' || d.status === 'COMPLETED').length;

  const todayStr = (() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const overdueCount = deliverables.filter(d => {
    if (!d.dueDate) return false;
    const isPast = d.dueDate < todayStr;
    const isDone = d.status === 'DELIVERED' || d.status === 'COMPLETED';
    return isPast && !isDone;
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      {/* Total */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3 shadow-lg">
        <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Total</p>
          <p className="text-xl font-bold text-white mt-0.5">{totalCount}</p>
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3 shadow-lg">
        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">In Progress</p>
          <p className="text-xl font-bold text-white mt-0.5">{inProgressCount}</p>
        </div>
      </div>

      {/* Waiting for Client */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3 shadow-lg">
        <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Waiting Client</p>
          <p className="text-xl font-bold text-white mt-0.5">{waitingForClientCount}</p>
        </div>
      </div>

      {/* Ready for Review */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3 shadow-lg">
        <div className="p-2.5 rounded-lg bg-fuchsia-500/10 text-fuchsia-400">
          <Eye className="h-5 w-5" />
        </div>
        <div>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">For Review</p>
          <p className="text-xl font-bold text-white mt-0.5">{readyForReviewCount}</p>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3 shadow-lg">
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Completed</p>
          <p className="text-xl font-bold text-white mt-0.5">{completedCount}</p>
        </div>
      </div>

      {/* Overdue */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3 shadow-lg">
        <div className={`p-2.5 rounded-lg ${overdueCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Overdue</p>
          <p className={`text-xl font-bold mt-0.5 ${overdueCount > 0 ? 'text-rose-400 font-extrabold' : 'text-white'}`}>
            {overdueCount}
          </p>
        </div>
      </div>
    </div>
  );
};
