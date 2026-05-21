import React from 'react';
import type { EventResponse } from '../../events/types';
import { CalendarDays, MapPin, Clock, ArrowRight } from 'lucide-react';

interface TodayEventsPanelProps {
  events: EventResponse[];
  onNavigateToEvents: () => void;
}

export const TodayEventsPanel: React.FC<TodayEventsPanelProps> = ({
  events,
  onNavigateToEvents,
}) => {
  const formatTimeRange = (start: string, end: string) => {
    // start and end are HH:mm:ss or HH:mm
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-base flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-400" />
            Today's Shoots
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Crew events happening today</p>
        </div>
        <button
          onClick={onNavigateToEvents}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-all duration-200"
        >
          View Calendar <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
        {events.length === 0 ? (
          <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-lg">
            <p className="text-slate-400 text-sm font-medium">No events scheduled for today</p>
            <p className="text-slate-600 text-xs mt-1">Enjoy the quiet day or schedule a new event</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-slate-900/60 border border-slate-850 rounded-lg space-y-2 hover:border-slate-700/60 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <h4 className="text-white font-semibold text-sm line-clamp-1">
                  {event.title}
                </h4>
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
                  <span className="truncate">
                    {event.venueName}, {event.city}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
