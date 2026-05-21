import React from 'react';
import type { Deliverable } from '../../deliverables/types';
import { ClipboardList, AlertCircle, CheckCircle } from 'lucide-react';

interface DeliverablesOverviewProps {
  deliverables: Deliverable[];
}

export const DeliverablesOverview: React.FC<DeliverablesOverviewProps> = ({ deliverables }) => {
  const today = new Date().toISOString().split('T')[0];

  const total = deliverables.length;
  
  const inProgress = deliverables.filter(
    (d) => d.status === 'IN_PROGRESS' || d.status === 'NOT_STARTED'
  ).length;

  const waitingForClient = deliverables.filter(
    (d) => d.status === 'WAITING_FOR_CLIENT'
  ).length;

  const readyForReview = deliverables.filter(
    (d) => d.status === 'READY_FOR_REVIEW' || d.status === 'REVISION_REQUIRED'
  ).length;

  const completed = deliverables.filter(
    (d) => d.status === 'COMPLETED' || d.status === 'DELIVERED'
  ).length;

  const overdue = deliverables.filter(
    (d) => d.dueDate && d.dueDate < today && d.status !== 'COMPLETED' && d.status !== 'DELIVERED'
  ).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-6 flex flex-col shadow-lg">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-base flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-violet-400" />
          Post-Production Tracking
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">Post-shoot delivery milestones & status</p>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-between">
        {/* Progress Bar */}
        <div className="space-y-2 bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Milestones Completed</span>
            <span className="text-indigo-400">{completed} / {total} ({completionRate}%)</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">In Edit / Queue</span>
            <span className="text-base font-bold text-slate-200 mt-1">{inProgress}</span>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Waiting Client</span>
            <span className="text-base font-bold text-slate-200 mt-1">{waitingForClient}</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Ready for Review</span>
            <span className="text-base font-bold text-slate-200 mt-1">{readyForReview}</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Completed</span>
            <span className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {completed}
            </span>
          </div>
        </div>

        {/* Overdue Banner */}
        {overdue > 0 ? (
          <div className="mt-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg flex items-center gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 flex-shrink-0" />
            <div className="text-xs">
              <strong className="font-semibold">{overdue} Overdue Task{overdue > 1 ? 's' : ''}</strong> requires your immediate attention!
            </div>
          </div>
        ) : (
          <div className="mt-3 bg-emerald-500/5 border border-emerald-500/10 text-slate-400 p-3 rounded-lg text-xs text-center">
            ✨ All active deliverables are within their due dates.
          </div>
        )}
      </div>
    </div>
  );
};
