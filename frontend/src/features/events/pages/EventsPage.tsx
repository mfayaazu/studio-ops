import React, { useEffect, useState } from 'react';
import { eventsApi } from '../api/eventsApi';
import type { EventResponse, EventCreateRequest, EventType, EventStatus } from '../types';
import { projectsApi } from '../../projects/api/projectsApi';
import type { ProjectResponse } from '../../projects/types';
import { Calendar as CalendarIcon, Search, Plus, Trash2, Edit3, X, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null);
  
  // Form states
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
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async (search?: string, from?: string, to?: string) => {
    setLoading(true);
    try {
      const [eventsList, projectsList] = await Promise.all([
        eventsApi.list(search, from || undefined, to || undefined),
        projectsApi.list()
      ]);
      setEvents(eventsList);
      setProjects(projectsList);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(searchTerm, fromDate, toDate);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    fetchData();
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setProjectId(projects[0]?.id || '');
    setTitle('');
    setType('WEDDING');
    
    // Default event date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEventDate(tomorrow.toISOString().split('T')[0]);
    
    setStartTime('09:00');
    setEndTime('17:00');
    setVenueName('');
    setCity('');
    setAddress('');
    setStatus('SCHEDULED');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventResponse) => {
    setEditingEvent(event);
    setProjectId(event.projectId);
    setTitle(event.title);
    setType(event.type);
    setEventDate(event.eventDate);
    
    // Format times from HH:MM:ss to HH:MM if needed
    const formatTime = (t: string) => {
      const parts = t.split(':');
      if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
      return t;
    };
    
    setStartTime(formatTime(event.startTime));
    setEndTime(formatTime(event.endTime));
    setVenueName(event.venueName);
    setCity(event.city);
    setAddress(event.address);
    setStatus(event.status);
    setNotes(event.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!projectId || !title.trim() || !eventDate || !startTime || !endTime || !venueName.trim() || !city.trim() || !address.trim()) {
      setFormError('All fields marked * are required.');
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

    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, payload);
      } else {
        await eventsApi.create(payload);
      }
      setIsModalOpen(false);
      fetchData(searchTerm, fromDate, toDate);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving event.');
    }
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete event "${name}"?`)) {
      return;
    }
    
    try {
      await eventsApi.delete(id);
      fetchData(searchTerm, fromDate, toDate);
    } catch (err: any) {
      alert(err.message || 'Failed to delete event.');
    }
  };

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Events Calendar</h2>
          <p className="text-slate-400 text-xs mt-1">Schedule shoots, track venues, and manage day-of photography schedules</p>
        </div>
        
        <button
          onClick={openCreateModal}
          disabled={projects.length === 0}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Event</span>
        </button>
      </div>

      {projects.length === 0 && (
        <div className="bg-amber-500/15 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>You must create at least one project before establishing an event schedule.</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4">
        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search events by title, venue, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <input
              type="date"
              value={fromDate}
              placeholder="From Date"
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={toDate}
              placeholder="To Date"
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Filter
            </button>
            {(searchTerm || fromDate || toDate) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-sm font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Events List/Table */}
      <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono animate-pulse">Loading scheduled events...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No events found</p>
            <p className="text-slate-500 text-xs mt-1">Try expanding dates or schedule a new event shoot</p>
          </div>
        ) : (
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
                  <tr key={evt.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-[10px] text-violet-400 font-semibold">{getProjectCode(evt.projectId)}</div>
                      <div className="font-bold text-white text-sm mt-0.5">{evt.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate" title={evt.notes}>{evt.notes || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] ${getTypeBadgeClass(evt.type)}`}>
                        {evt.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <div className="font-semibold">{formatDate(evt.eventDate)}</div>
                      <div className="text-slate-550 font-mono mt-0.5 text-[11px]">{evt.startTime.substring(0, 5)} - {evt.endTime.substring(0, 5)}</div>
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(evt)}
                          className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit Event"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
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
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20">
              <h3 className="text-white font-semibold text-base">
                {editingEvent ? 'Edit Scheduled Event' : 'Schedule New Event Shoot'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Link *</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>[{p.projectCode}] {p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Event Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
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
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sangeet Ceremony"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">End Time *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Venue Name *</label>
                  <input
                    type="text"
                    required
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Grand Ballroom, Marriott"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, landmark details..."
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Event Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EventStatus)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instructions for the crew, shooting details..."
                  rows={3}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer"
                >
                  {editingEvent ? 'Save Changes' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
