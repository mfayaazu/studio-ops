import React from 'react';
import type { EventResponse, EventStatus, EventType } from '../types';
import type { ProjectResponse } from '../../projects/types';
import { Edit3, Trash2, Eye } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface EventListProps {
  events: EventResponse[];
  projects: ProjectResponse[];
  onEdit: (event: EventResponse) => void;
  onDelete: (id: string, title: string) => void;
  onSelectEvent: (event: EventResponse) => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  projects,
  onEdit,
  onDelete,
  onSelectEvent,
}) => {
  const getProjectCode = (id: string) => {
    const project = projects.find(p => p.id === id);
    return project ? project.projectCode : 'Unknown';
  };

  const getStatusBadgeClass = (status: EventStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'COMPLETED':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'CANCELLED':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default:
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  const getTypeBadgeClass = (type: EventType) => {
    switch (type) {
      case 'WEDDING':
        return 'bg-violet-500/10 border-violet-500/20 text-violet-400';
      case 'ENGAGEMENT':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'RECEPTION':
        return 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400';
      case 'HALDI':
      case 'MEHENDI':
      case 'SANGEET':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      default:
        return 'bg-slate-500/10 border-slate-800/80 text-slate-400';
    }
  };

  // Format times from HH:MM:ss to HH:MM
  const formatTime = (t: string) => {
    const parts = t.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return t;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/40">
            <th className="px-6 py-4">Project & Event Details</th>
            <th className="px-6 py-4">Event Type</th>
            <th className="px-6 py-4">Date & Time</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 text-slate-300">
          {events.map((evt) => (
            <tr key={evt.id} className="hover:bg-slate-800/10 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-mono text-[10px] text-violet-400 font-semibold">{getProjectCode(evt.projectId)}</div>
                <button
                  type="button"
                  onClick={() => onSelectEvent(evt)}
                  className="font-bold text-white text-sm mt-0.5 hover:text-violet-400 hover:underline text-left focus:outline-none"
                >
                  {evt.title}
                </button>
                <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate" title={evt.notes}>{evt.notes || '—'}</div>
              </td>
              <td className="px-6 py-4 text-xs font-semibold">
                <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] ${getTypeBadgeClass(evt.type)}`}>
                  {evt.type}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-300">
                <div className="font-semibold">{formatDate(evt.eventDate)}</div>
                <div className="text-slate-500 font-mono mt-0.5 text-[11px]">{formatTime(evt.startTime)} - {formatTime(evt.endTime)}</div>
              </td>
              <td className="px-6 py-4 text-xs text-slate-400">
                <div className="text-slate-300 font-medium">{evt.venueName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{evt.city} • {evt.address}</div>
              </td>
              <td className="px-6 py-4 text-xs">
                <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full border text-[10px] uppercase ${getStatusBadgeClass(evt.status)}`}>
                  {evt.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onSelectEvent(evt)}
                    className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(evt)}
                    className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(evt.id, evt.title)}
                    className="p-1.5 rounded bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
