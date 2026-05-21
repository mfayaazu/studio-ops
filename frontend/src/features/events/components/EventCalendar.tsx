import React, { useState, useMemo } from 'react';
import type { EventResponse, EventType } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface EventCalendarProps {
  events: EventResponse[];
  onSelectEvent: (event: EventResponse) => void;
  onCreateEventForDate?: (dateStr: string) => void;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  onSelectEvent,
  onCreateEventForDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper arrays
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate grid parameters
  const firstDayOfMonthIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Group events by YYYY-MM-DD
  const eventsByDay = useMemo(() => {
    const groups: { [dateStr: string]: EventResponse[] } = {};
    events.forEach((evt) => {
      const dateKey = evt.eventDate;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(evt);
    });

    // Sort each day's events by start time
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return groups;
  }, [events]);

  // Styling helper for chip colors
  const getEventChipClass = (type: EventType) => {
    switch (type) {
      case 'WEDDING':
        return 'bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20';
      case 'ENGAGEMENT':
        return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20';
      case 'RECEPTION':
        return 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/20';
      case 'HALDI':
      case 'MEHENDI':
      case 'SANGEET':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20';
      default:
        return 'bg-slate-500/10 border-slate-700 text-slate-300 hover:bg-slate-500/20';
    }
  };

  // Generate date keys for the grid cells
  const getYYYYMMDD = (dayNum: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Grid cells render logic
  const cells = [];
  
  // Padding cells for previous month days
  for (let i = 0; i < firstDayOfMonthIndex; i++) {
    cells.push(<div key={`empty-${i}`} className="bg-slate-950/20 min-h-[100px] border-b border-r border-slate-800/60" />);
  }

  // Active days cells
  const todayStr = new Date().toISOString().split('T')[0];
  
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = getYYYYMMDD(d);
    const dayEvents = eventsByDay[dateStr] || [];
    const isToday = dateStr === todayStr;

    cells.push(
      <div
        key={`day-${d}`}
        className={`min-h-[110px] bg-[#0d1424]/40 border-b border-r border-slate-800/60 p-2 flex flex-col group relative ${
          isToday ? 'bg-violet-950/10' : ''
        }`}
      >
        {/* Day Number and Quick Add */}
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`text-xs font-mono font-semibold ${
              isToday
                ? 'bg-violet-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md shadow-violet-500/20'
                : 'text-slate-400'
            }`}
          >
            {d}
          </span>
          {onCreateEventForDate && (
            <button
              type="button"
              onClick={() => onCreateEventForDate(dateStr)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-slate-850 text-slate-500 hover:text-white cursor-pointer"
              title="Add event on this day"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Day's Events List */}
        <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] scrollbar-thin">
          {dayEvents.map((evt) => (
            <button
              key={evt.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectEvent(evt);
              }}
              className={`w-full text-left truncate text-[10px] font-medium border px-1.5 py-0.5 rounded transition-all cursor-pointer block ${getEventChipClass(
                evt.type
              )}`}
              title={`${evt.title} (${evt.startTime.substring(0, 5)} - ${evt.endTime.substring(0, 5)})`}
            >
              <span className="font-mono opacity-80 mr-1">{evt.startTime.substring(0, 5)}</span>
              {evt.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Padding cells at end of month to make full weeks grid if needed
  const totalCells = cells.length;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    cells.push(<div key={`empty-end-${i}`} className="bg-slate-950/20 min-h-[100px] border-b border-r border-slate-800/60" />);
  }

  return (
    <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Calendar Header / Navigation */}
      <div className="px-6 py-4 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <span className="text-violet-400 font-bold">{monthNames[month]}</span>
          <span className="text-slate-400 font-mono text-base">{year}</span>
        </h3>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-350 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels Grid */}
      <div className="grid grid-cols-7 text-center border-b border-slate-800/60 bg-slate-900/10">
        {dayNames.map((day) => (
          <div
            key={day}
            className={`py-2 text-[10px] font-bold uppercase tracking-wider ${
              day === 'Sun' || day === 'Sat' ? 'text-slate-500' : 'text-slate-450'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid Cells */}
      <div className="grid grid-cols-7 border-l border-slate-800/60 bg-slate-950/5">
        {cells}
      </div>
    </div>
  );
};
