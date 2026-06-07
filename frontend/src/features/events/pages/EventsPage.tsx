import React, { useEffect, useState } from 'react';
import { eventsApi } from '../api/eventsApi';
import type { EventResponse, EventCreateRequest } from '../types';
import { projectsApi } from '../../projects/api/projectsApi';
import type { ProjectResponse } from '../../projects/types';
import { Calendar as CalendarIcon, List, Search, Plus, X, AlertTriangle } from 'lucide-react';

// Import our new subcomponents
import { EventList } from '../components/EventList';
import { EventForm } from '../components/EventForm';
import { EventCalendar } from '../components/EventCalendar';
import { EventDetailDrawer } from '../components/EventDetailDrawer';

export const EventsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null);
  const [preSelectedDate, setPreSelectedDate] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Drawer / Detail States
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    setPreSelectedDate(undefined);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openCreateModalForDate = (dateStr: string) => {
    setEditingEvent(null);
    setPreSelectedDate(dateStr);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventResponse) => {
    setEditingEvent(event);
    setPreSelectedDate(undefined);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (evt: EventResponse) => {
    setSelectedEvent(evt);
    setIsDrawerOpen(true);
  };

  const handleEditFromDrawer = (evt: EventResponse) => {
    setIsDrawerOpen(false);
    openEditModal(evt);
  };

  const handleSaveEvent = async (payload: EventCreateRequest) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, payload);
      } else {
        await eventsApi.create(payload);
      }
      setIsModalOpen(false);
      setEditingEvent(null);
      setPreSelectedDate(undefined);
      
      // Update drawer event reference in case it is open
      if (selectedEvent && selectedEvent.id === (editingEvent?.id || '')) {
        // Fetch new state for this event if needed, or simply reload everything
        // For simplicity, we just close the drawer and reload
        setIsDrawerOpen(false);
        setSelectedEvent(null);
      }

      fetchData(searchTerm, fromDate, toDate);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) {
      return;
    }
    
    try {
      await eventsApi.delete(id);
      setIsDrawerOpen(false);
      setSelectedEvent(null);
      fetchData(searchTerm, fromDate, toDate);
    } catch (err: any) {
      alert(err.message || 'Failed to delete event.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Events Calendar</h2>
          <p className="text-slate-400 text-xs mt-1">Schedule shoots, track venues, and manage day-of photography schedules</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggler */}
          <div className="bg-[#090d16] p-1 rounded-lg border border-slate-800 flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-slate-850 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-slate-850 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* New Event Button */}
          <button
            type="button"
            onClick={openCreateModal}
            disabled={projects.length === 0}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </button>
        </div>
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
              className="w-full bg-[#090d16] border border-slate-850 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <input
              type="date"
              value={fromDate}
              placeholder="From Date"
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={toDate}
              placeholder="To Date"
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
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

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-12 text-center text-slate-500 font-mono animate-pulse">
          Loading scheduled events...
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="space-y-4">
          {events.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">No scheduled events yet. Confirm a project or create an event to allocate resources.</span>
            </div>
          )}
          <EventCalendar
            events={events}
            onSelectEvent={handleSelectEvent}
            onCreateEventForDate={projects.length > 0 ? openCreateModalForDate : undefined}
          />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-16 text-center">
          <CalendarIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No events found</p>
          <p className="text-slate-500 text-xs mt-1">Try clearing filters or schedule a new event shoot</p>
        </div>
      ) : (
        <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
          <EventList
            events={events}
            projects={projects}
            onEdit={openEditModal}
            onDelete={handleDeleteEvent}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      )}

      {/* Event Details Drawer Overlay */}
      <EventDetailDrawer
        isOpen={isDrawerOpen}
        event={selectedEvent}
        projects={projects}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEditFromDrawer}
        onDelete={handleDeleteEvent}
      />

      {/* Create / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-48px)]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20 flex-shrink-0 flex-none">
              <h3 className="text-white font-semibold text-base">
                {editingEvent ? 'Edit Scheduled Event' : 'Schedule New Event Shoot'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body with Form */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <EventForm
                initialData={editingEvent}
                defaultDate={preSelectedDate}
                projects={projects}
                onSubmit={handleSaveEvent}
                onCancel={() => setIsModalOpen(false)}
                isSubmitting={isSubmitting}
                submitError={formError}
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
