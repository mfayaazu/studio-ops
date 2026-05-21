import React from 'react';

export const AvailabilityLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-[#0d1424] border border-slate-800/80 p-4 rounded-xl">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Legend:</span>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#090d16] border border-slate-800" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-violet-600 to-fuchsia-600 border border-violet-500/20" />
          <span>Booked Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[10px] text-rose-400 font-bold">
            !
          </div>
          <span>Schedule Conflict</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded border border-slate-800 bg-slate-900/40"
            style={{
              backgroundImage: 'linear-gradient(45deg, #1e293b 25%, transparent 25%, transparent 50%, #1e293b 50%, #1e293b 75%, transparent 75%, transparent)',
              backgroundSize: '6px 6px'
            }}
          />
          <span>On Leave / Inactive</span>
        </div>
      </div>
    </div>
  );
};
