import React, { useEffect, useState } from 'react';
import { employeesApi } from '../../employees/api/employeesApi';
import { eventsApi } from '../../events/api/eventsApi';
import { assignmentsApi } from '../api/assignmentsApi';
import type { Employee } from '../../employees/types';
import type { EventResponse } from '../../events/types';
import type { EventAssignment } from '../types';
import { AvailabilityLegend } from '../components/AvailabilityLegend';
import { AvailabilityTimeline } from '../components/AvailabilityTimeline';
import { Calendar, Search, ArrowLeft, ArrowRight, AlertTriangle, RefreshCw, Filter, Users } from 'lucide-react';

const getTodayDateString = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const AvailabilityPlannerPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // API Data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allAssignments, setAllAssignments] = useState<EventAssignment[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);

  // Page States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch employees, assignments, and events on the selected date concurrently
      const [empList, assignList, eventList] = await Promise.all([
        employeesApi.list(),
        assignmentsApi.list(),
        eventsApi.list(undefined, date, date),
      ]);

      setEmployees(empList);
      setAllAssignments(assignList);
      setEvents(eventList);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve crew availability data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSetToday = () => {
    setSelectedDate(getTodayDateString());
  };

  // In-Memory Filtering for Crew Rows
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.skills && emp.skills.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'ALL' || emp.primaryRole === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Filter assignments to only those linked to events occurring on the selected date
  const eventIdsOnDate = new Set(events.map((e) => e.id));
  const filteredAssignments = allAssignments.filter((a) => eventIdsOnDate.has(a.eventId));

  const roleOptions = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'TRADITIONAL_PHOTOGRAPHER', label: 'Traditional Photographer' },
    { value: 'TRADITIONAL_VIDEOGRAPHER', label: 'Traditional Videographer' },
    { value: 'CANDID_PHOTOGRAPHER', label: 'Candid Photographer' },
    { value: 'CINEMATOGRAPHER', label: 'Cinematographer' },
    { value: 'DRONE_OPERATOR', label: 'Drone Operator' },
    { value: 'LIGHTING_ASSISTANT', label: 'Lighting Assistant' },
    { value: 'ASSISTANT', label: 'Assistant' },
    { value: 'EDITOR', label: 'Editor' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Crew Availability Planner</h2>
          <p className="text-slate-400 text-xs mt-1">
            Visual hourly timeline to monitor double bookings and assign crew efficiently
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => fetchData(selectedDate)}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-750 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Date Navigation & Filters Panel */}
      <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          
          {/* Date Picker & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#090d16] border border-slate-800/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors font-semibold"
              />
            </div>

            <div className="flex items-center border border-slate-850 rounded-lg overflow-hidden bg-[#090d16]">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors border-r border-slate-850 cursor-pointer"
                title="Previous Day"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSetToday}
                className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-850 transition-colors border-r border-slate-850 cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextDay}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
                title="Next Day"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400 font-medium px-2.5 py-1 rounded bg-[#090d16] border border-slate-850/60 font-mono">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Filtering Fields */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search crew by name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#090d16] border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer font-medium"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Legend Block */}
      <AvailabilityLegend />

      {/* Error Panel */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchData(selectedDate)}
            className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold px-3 py-1.5 rounded-lg border border-rose-500/30 transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Timeline View */}
      {loading ? (
        <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-16 text-center text-slate-400 font-mono animate-pulse shadow-lg flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 text-violet-500 animate-spin" />
          <span>Assembling daily schedule matrix...</span>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-16 text-center shadow-lg">
          <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No Crew Members Found</p>
          <p className="text-slate-500 text-xs mt-1">
            Try adjusting your search queries or filtering criteria
          </p>
        </div>
      ) : (
        <AvailabilityTimeline
          employees={filteredEmployees}
          assignments={filteredAssignments}
          events={events}
        />
      )}
    </div>
  );
};
