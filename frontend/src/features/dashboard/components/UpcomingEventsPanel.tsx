import React from 'react';
import type { EventResponse } from '../../events/types';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface UpcomingEventsPanelProps {
  events: EventResponse[];
}

export const UpcomingEventsPanel: React.FC<UpcomingEventsPanelProps> = ({ events }) => {
  const formatTimeRange = (start: string, end: string) => {
    const formatTime = (t: string) => {
      const parts = t.split(':');
      if (parts.length < 2) return t;
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  return (
    <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-6 flex flex-col h-full shadow-lg">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-base flex items-center gap-2">
          <Calendar className="h-5 w-5 text-sky-400" />
          Upcoming Shoot Pipeline
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">Chronological list of next shoots</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
        {events.length === 0 ? (
          <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-lg">
            <p className="text-slate-400 text-sm font-medium">No upcoming shoots found</p>
            <p className="text-slate-600 text-xs mt-1">Schedules are clear for the near future</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="relative p-4 bg-slate-900/40 border border-slate-850 rounded-lg space-y-2 hover:border-slate-800 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-white font-semibold text-sm line-clamp-1">
                    {event.title}
                  </h4>
                  <span className="text-[10px] text-sky-400 font-mono tracking-wider">
                    {formatDate(event.eventDate)}
                  </span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  event.status === 'SCHEDULED'
                    ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                    : event.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-slate-700/10 border-slate-700/20 text-slate-400'
                }`}>
                  {event.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Clock className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{formatTimeRange(event.startTime, event.endTime)}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{event.city}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
