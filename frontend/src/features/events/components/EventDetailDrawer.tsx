import React from 'react';
import type { EventResponse, EventStatus, EventType } from '../types';
import type { ProjectResponse } from '../../projects/types';
import { X, Calendar, Clock, MapPin, AlignLeft, Trash2, Edit3, Briefcase } from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { EventAssignmentsPanel } from '../../assignments/components/EventAssignmentsPanel';

interface EventDetailDrawerProps {
  isOpen: boolean;
  event: EventResponse | null;
  projects: ProjectResponse[];
  onClose: () => void;
  onEdit: (event: EventResponse) => void;
  onDelete: (id: string, title: string) => void;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  isOpen,
  event,
  projects,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !event) return null;

  const project = projects.find(p => p.id === event.projectId);

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

  const formatTime = (t: string) => {
    const parts = t.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return t;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0d1424] border-l border-slate-850 shadow-2xl flex flex-col justify-between animate-slide-in">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-850 flex items-start justify-between bg-slate-900/20">
          <div className="space-y-1.5 mr-4">
            <div className="flex flex-wrap gap-1.5">
              <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${getTypeBadgeClass(event.type)}`}>
                {event.type}
              </span>
              <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full border text-[10px] uppercase ${getStatusBadgeClass(event.status)}`}>
                {event.status}
              </span>
            </div>
            <h3 className="text-white font-bold text-lg tracking-wide leading-snug">{event.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Linked Project */}
          <div className="space-y-2 bg-[#090d16]/60 border border-slate-850/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Briefcase className="h-3.5 w-3.5 text-violet-400" />
              <span>Linked Project</span>
            </div>
            {project ? (
              <div className="space-y-1">
                <div className="font-mono text-xs font-bold text-violet-400">{project.projectCode}</div>
                <div className="text-sm font-semibold text-white">{project.title}</div>
                <div className="text-xs text-slate-400">{project.projectType}</div>
              </div>
            ) : (
              <div className="text-sm text-slate-450 italic">Project not found or deleted</div>
            )}
          </div>

          {/* Timing details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-850 pb-1">
              <Clock className="h-3.5 w-3.5 text-violet-400" />
              <span>Schedule Details</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Date</span>
                <div className="text-sm text-slate-200 font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-450" />
                  <span>{formatDate(event.eventDate)}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Timings</span>
                <div className="text-sm text-slate-200 font-mono font-medium">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-850 pb-1">
              <MapPin className="h-3.5 w-3.5 text-violet-400" />
              <span>Venue & Location</span>
            </div>
            <div className="space-y-2">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Venue</span>
                <div className="text-sm text-slate-200 font-semibold">{event.venueName}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">City</span>
                  <div className="text-sm text-slate-350">{event.city}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Full Address</span>
                  <div className="text-sm text-slate-350 break-words leading-relaxed">{event.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-850 pb-1">
              <AlignLeft className="h-3.5 w-3.5 text-violet-400" />
              <span>Crew Instructions & Notes</span>
            </div>
            <div className="bg-[#090d16]/30 border border-slate-850/50 rounded-xl p-4 text-sm text-slate-350 whitespace-pre-wrap leading-relaxed min-h-[80px]">
              {event.notes || <span className="text-slate-550 italic">No notes provided for this event.</span>}
            </div>
          </div>

          {/* Crew / Assignments Panel */}
          <EventAssignmentsPanel eventId={event.id} />

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-slate-850 bg-slate-900/20 flex gap-3">
          <button
            type="button"
            onClick={() => onEdit(event)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm py-2.5 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Event</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(event.id, event.title)}
            className="flex-shrink-0 flex items-center justify-center p-2.5 rounded-lg border border-rose-500/30 hover:border-rose-500 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete Event"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

      </div>
    </>
  );
};
