import React from 'react';
import type { DashboardWarning } from '../types';
import { AlertOctagon, UserX, ShieldCheck } from 'lucide-react';
import { formatConflictTime } from '../../../lib/utils';

interface ConflictWarningsPanelProps {
  warnings: DashboardWarning[];
}

export const ConflictWarningsPanel: React.FC<ConflictWarningsPanelProps> = ({ warnings }) => {
  return (
    <section className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium text-base flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-amber-500" />
            Scheduling Conflicts & Double-Bookings
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Crew double-bookings requiring reallocation or availability adjustments</p>
        </div>
        {warnings.length > 0 && (
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            {warnings.length} Conflict{warnings.length > 1 ? 's' : ''} Detected
          </span>
        )}
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {warnings.length === 0 ? (
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4 text-emerald-450 text-xs flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>All employee schedules are clear. No double-bookings or scheduling conflicts detected.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warnings.map((warn, index) => (
              <div
                key={index}
                className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4 space-y-2.5 flex items-start gap-3.5 hover:border-amber-500/25 transition-all duration-200"
              >
                <div className="p-2 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-400 flex-shrink-0 mt-0.5">
                  <UserX className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {warn.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatConflictTime(warn.conflictTime)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Crew member <strong className="text-white">{warn.employeeName}</strong> is assigned to both:
                  </p>
                  <div className="text-xs bg-slate-900/50 border border-slate-850 p-2 rounded space-y-1">
                    <div className="text-slate-200 truncate font-semibold">
                      • {warn.eventTitle}
                    </div>
                    <div className="text-slate-200 truncate font-semibold">
                      • {warn.overlappingEventTitle}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
