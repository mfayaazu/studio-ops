import React, { useState, useEffect } from 'react';
import type { EventResponse, EventCreateRequest, EventType, EventStatus } from '../types';
import type { ProjectResponse } from '../../projects/types';
import { AlertTriangle } from 'lucide-react';

interface EventFormProps {
  initialData?: EventResponse | null;
  defaultDate?: string;
  projects: ProjectResponse[];
  onSubmit: (data: EventCreateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  defaultDate,
  projects,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError
}) => {
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('WEDDING');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<EventStatus>('SCHEDULED');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setProjectId(initialData.projectId || '');
      setTitle(initialData.title || '');
      setType(initialData.type || 'WEDDING');
      setEventDate(initialData.eventDate || '');
      
      // Format times from HH:MM:ss to HH:MM for input fields
      const formatTimeInput = (t: string) => {
        const parts = t.split(':');
        if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
        return t;
      };
      
      setStartTime(formatTimeInput(initialData.startTime || '09:00'));
      setEndTime(formatTimeInput(initialData.endTime || '17:00'));
      setVenueName(initialData.venueName || '');
      setCity(initialData.city || '');
      setAddress(initialData.address || '');
      setStatus(initialData.status || 'SCHEDULED');
      setNotes(initialData.notes || '');
    } else {
      setProjectId(projects[0]?.id || '');
      setTitle('');
      setType('WEDDING');
      
      // Default event date to defaultDate or tomorrow
      if (defaultDate) {
        setEventDate(defaultDate);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setEventDate(tomorrow.toISOString().split('T')[0]);
      }
      
      setStartTime('09:00');
      setEndTime('17:00');
      setVenueName('');
      setCity('');
      setAddress('');
      setStatus('SCHEDULED');
      setNotes('');
    }
    setValidationError(null);
  }, [initialData, defaultDate, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!projectId) {
      setValidationError('Project Link is required.');
      return;
    }
    if (!title.trim()) {
      setValidationError('Event Title is required.');
      return;
    }
    if (!eventDate) {
      setValidationError('Event Date is required.');
      return;
    }
    if (!startTime) {
      setValidationError('Start Time is required.');
      return;
    }
    if (!endTime) {
      setValidationError('End Time is required.');
      return;
    }
    if (!venueName.trim()) {
      setValidationError('Venue Name is required.');
      return;
    }
    if (!city.trim()) {
      setValidationError('City is required.');
      return;
    }
    if (!address.trim()) {
      setValidationError('Full Address is required.');
      return;
    }

    // Validation: startTime < endTime
    if (startTime >= endTime) {
      setValidationError('Start time must be before end time.');
      return;
    }

    // Append seconds to times so backend LocalTime parser accepts them: HH:mm:ss
    const formatPayloadTime = (time: string) => {
      if (time.split(':').length === 2) {
        return `${time}:00`;
      }
      return time;
    };

    const payload: EventCreateRequest = {
      projectId,
      title: title.trim(),
      type,
      eventDate,
      startTime: formatPayloadTime(startTime),
      endTime: formatPayloadTime(endTime),
      venueName: venueName.trim(),
      city: city.trim(),
      address: address.trim(),
      status,
      notes: notes.trim() || undefined
    };

    await onSubmit(payload);
  };

  const displayedError = validationError || submitError;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-220px)] space-y-4 pr-1">
        {displayedError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{displayedError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Project Link <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={isSubmitting || projects.length === 0}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            >
              {projects.length === 0 && (
                <option value="">No projects available</option>
              )}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.projectCode}] {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Event Type
            </label>
            <select
              disabled={isSubmitting}
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            >
              <option value="WEDDING">Wedding</option>
              <option value="ENGAGEMENT">Engagement</option>
              <option value="RECEPTION">Reception</option>
              <option value="HALDI">Haldi</option>
              <option value="MEHENDI">Mehendi</option>
              <option value="SANGEET">Sangeet</option>
              <option value="BIRTHDAY">Birthday</option>
              <option value="HOUSEWARMING">Housewarming</option>
              <option value="PRE_WEDDING">Pre-Wedding</option>
              <option value="CORPORATE">Corporate</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Event Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sangeet Ceremony"
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Event Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              disabled={isSubmitting}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Start Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              disabled={isSubmitting}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              End Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              disabled={isSubmitting}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Venue Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="e.g. Grand Ballroom, Sheraton"
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Full Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 123 Luxury Road, Bandra West"
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Event Status
            </label>
            <select
              disabled={isSubmitting}
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Internal Notes
          </label>
          <textarea
            disabled={isSubmitting}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instructions for the crew, shoot specifics, gear required..."
            rows={3}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none disabled:opacity-50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-850 flex-none mt-4">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || projects.length === 0}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Schedule Event'}
        </button>
      </div>
    </form>
  );
};
