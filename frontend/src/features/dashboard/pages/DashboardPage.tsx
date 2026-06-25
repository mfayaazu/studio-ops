import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { eventsApi } from '../../events/api/eventsApi';
import { projectsApi } from '../../projects/api/projectsApi';
import { deliverablesApi } from '../../deliverables/api/deliverablesApi';
import { backupsApi } from '../../backups/api/backupsApi';
import { fetchLeads } from '../../followup/api/followupApi';
import { fetchEmployees } from '../../employees/api/employeesApi';
import { useRouter } from '../../../app/router';

import type { DashboardSummaryResponse } from '../types';
import type { EventResponse } from '../../events/types';
import type { Project } from '../../projects/types';
import type { Deliverable } from '../../deliverables/types';
import type { BackupRecord } from '../../backups/types';
import type { LeadResponse } from '../../followup/types';
import type { Employee } from '../../employees/types';

import { TodayEventsPanel } from '../components/TodayEventsPanel';
import { UpcomingEventsPanel } from '../components/UpcomingEventsPanel';
import { DeliverablesOverview } from '../components/DeliverablesOverview';
import { BackupRiskPanel } from '../components/BackupRiskPanel';
import { ConflictWarningsPanel } from '../components/ConflictWarningsPanel';
import { QuickActionsPanel } from '../components/QuickActionsPanel';

import { ShieldAlert, Sparkles, MessageSquare, CalendarRange, Banknote, UserX, Layers, ArrowRight, ClipboardCheck } from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/formatters';

const defaultSummary: DashboardSummaryResponse = {
  stats: {
    totalClients: 0,
    activeProjects: 0,
    upcomingEventsCount: 0,
    successfulBackupsCount: 0,
  },
  warnings: [],
  backupChecklists: [],
};

export const DashboardPage: React.FC = () => {
  const { navigateTo } = useRouter();
  const queryClient = useQueryClient();
  
  // Dashboard summary query (staleTime 30s)
  const { data: summary = defaultSummary, isLoading: loadingSummary, isError: isErrorSummary } = useQuery<DashboardSummaryResponse>({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary(),
    staleTime: 30000,
  });

  // Events query (staleTime 60s)
  const { data: events = [], isLoading: loadingEvents, isError: isErrorEvents } = useQuery<EventResponse[]>({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
    staleTime: 60000,
  });

  // Projects query (staleTime 60s)
  const { data: projects = [], isLoading: loadingProjects, isError: isErrorProjects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
    staleTime: 60000,
  });

  // Deliverables query (staleTime 60s)
  const { data: deliverables = [], isLoading: loadingDeliverables, isError: isErrorDeliverables } = useQuery<Deliverable[]>({
    queryKey: ['deliverables'],
    queryFn: () => deliverablesApi.list(),
    staleTime: 60000,
  });

  // Backups query (staleTime 60s)
  const { data: backups = [], isLoading: loadingBackups, isError: isErrorBackups } = useQuery<BackupRecord[]>({
    queryKey: ['backups'],
    queryFn: () => backupsApi.list(),
    staleTime: 60000,
  });

  // Leads query (staleTime 30s)
  const { data: rawLeads = [], isLoading: loadingLeads, isError: isErrorLeads } = useQuery<LeadResponse[]>({
    queryKey: ['leads'],
    queryFn: () => fetchLeads(),
    staleTime: 30000,
  });

  // Employees query (staleTime 60s)
  const { data: employees = [], isLoading: loadingEmployees, isError: isErrorEmployees } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => fetchEmployees(),
    staleTime: 60000,
  });

  const loading = loadingSummary || loadingEvents || loadingProjects || loadingDeliverables || loadingBackups || loadingLeads || loadingEmployees;
  const error = isErrorSummary || isErrorEvents || isErrorProjects || isErrorDeliverables || isErrorBackups || isErrorLeads || isErrorEmployees;

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['deliverables'] });
    queryClient.invalidateQueries({ queryKey: ['backups'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const todayEvents = events.filter((e) => e.eventDate === todayStr);
  const upcomingEvents = events
    .filter((e) => e.eventDate > todayStr)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.startTime.localeCompare(b.startTime));
  
  // 1. New Inquiries count
  const newInquiriesCount = rawLeads.filter(
    (l) => l.pipelineStage === 'NEW_LEAD' || l.pipelineStage === 'QUOTE_SENT'
  ).length;

  // 2. Follow-ups Due count (today or overdue)
  const todayZero = new Date();
  todayZero.setHours(0, 0, 0, 0);
  const followupsDueCount = rawLeads.filter((l) => {
    if (l.pipelineStage === 'CONFIRMED' || l.pipelineStage === 'LOST') return false;
    if (!l.nextFollowUpAt) return false;
    const nextDate = new Date(l.nextFollowUpAt);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate.getTime() <= todayZero.getTime();
  }).length;

  // 3. Bookings This Week count
  const { startOfWeek, endOfWeek } = (() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(today.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { startOfWeek: start, endOfWeek: end };
  })();
  const bookingsThisWeekCount = projects.filter((p) => {
    if (!p.startDate) return false;
    const projectDate = new Date(p.startDate);
    projectDate.setHours(0, 0, 0, 0);
    return projectDate.getTime() >= startOfWeek.getTime() && projectDate.getTime() <= endOfWeek.getTime();
  }).length;

  // 4. Pending Delivery Items count
  const pendingDeliverablesCount = deliverables.filter(
    (d) => d.status !== 'COMPLETED' && d.status !== 'DELIVERED'
  ).length;

  // 5. Payments Pending sum
  const totalPaymentsPending = projects.reduce((sum, p) => {
    if (p.status === 'CANCELLED') return sum;
    const budget = p.projectBudget || 0;
    const paid = p.amountPaid || 0;
    const pending = budget - paid;
    return pending > 0 ? sum + pending : sum;
  }, 0);

  // 6. Team On Leave count
  const teamOnLeaveCount = employees.filter((emp) => emp.status === 'ON_LEAVE').length;

  // Backup issues calculations
  const failedBackups = backups.filter((b) => b.status === 'FAILED').length;
  const needsAttention = backups.filter((b) => b.status === 'NEEDS_ATTENTION').length;
  const activeProjectsList = projects.filter((p) => p.status !== 'CANCELLED' && p.status !== 'ARCHIVED');
  const missingCloud = activeProjectsList.filter(
    (p) => !backups.some((b) => b.projectId === p.id && b.locationType === 'CLOUD_S3' && b.status === 'COMPLETED')
  ).length;
  const singleLocation = activeProjectsList.filter((p) => {
    const projectBackups = backups.filter((b) => b.projectId === p.id && b.status === 'COMPLETED');
    const locations = new Set(projectBackups.map((b) => b.locationType));
    return locations.size === 1;
  }).length;
  const backupIssuesCount = failedBackups + needsAttention + missingCloud + singleLocation;

  const conflictWarningsCount = summary.warnings.length;

  const formattedToday = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (error) {
    return (
      <main className="space-y-8">
        {/* Header and Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-radial-gradient from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-heading font-extrabold text-white tracking-wide">
                Operations Command Center
              </h2>
              <Sparkles className="h-5 w-5 text-indigo-400 animate-bounce" />
            </div>
            <p className="text-slate-400 text-xs font-mono">{formattedToday}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[11px] font-bold text-rose-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              Offline
            </div>
          </div>
        </div>

        {/* Center Failure Alert Card */}
        <div className="bg-rose-500/5 border border-dashed border-rose-500/20 rounded-2xl p-10 text-center max-w-xl mx-auto space-y-4 my-8">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-white font-bold text-sm">Dashboard Connection Error</h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              Unable to load operational stats and Conflict Warnings from the database. Please check your network and try again.
            </p>
          </div>
          <button
            onClick={handleRetry}
            className="py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold transition-colors border border-rose-500/20 cursor-pointer shadow-md"
          >
            Retry Dashboard Load
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-slate-800 rounded-lg w-1/4"></div>
          <div className="h-4 bg-slate-800 rounded-lg w-1/3"></div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-[#0d1424] border border-slate-800/80 rounded-xl p-5"></div>
          ))}
        </div>

        {/* Mid Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-[#0d1424] border border-slate-800/80 rounded-xl p-6"></div>
          <div className="h-80 bg-[#0d1424] border border-slate-800/80 rounded-xl p-6"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-8">
      {/* Header and Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-radial-gradient from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-heading font-extrabold text-white tracking-wide">
              Operations Command Center
            </h2>
            <Sparkles className="h-5 w-5 text-indigo-400 animate-bounce" />
          </div>
          <p className="text-slate-400 text-xs font-mono">{formattedToday}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Live Sync
          </div>
          {backupIssuesCount + conflictWarningsCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[11px] font-bold text-rose-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              {backupIssuesCount + conflictWarningsCount} Risk Alert{backupIssuesCount + conflictWarningsCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Today / Needs Attention Section */}
      <section className="space-y-4">
        <div>
          <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
            Today / Needs Attention
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Key operational tasks and studio metrics that require action.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: New Inquiries */}
          <div className="flex flex-col justify-between p-5 bg-[#0d1424] border border-slate-800/80 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">New Inquiries</span>
                <p className="text-[10px] text-slate-500 font-medium">People who recently contacted your studio.</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{newInquiriesCount}</h3>
              <button 
                onClick={() => navigateTo('follow-up-center')}
                className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer group-hover:translate-x-0.5 transform duration-200"
              >
                View Inquiries <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Card 2: Follow-ups Due */}
          <div className="flex flex-col justify-between p-5 bg-[#0d1424] border border-slate-800/80 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Follow-ups Due</span>
                <p className="text-[10px] text-slate-500 font-medium">Clients you should call or message today.</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ClipboardCheck className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{followupsDueCount}</h3>
              <button 
                onClick={() => navigateTo('follow-up-center')}
                className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer group-hover:translate-x-0.5 transform duration-200"
              >
                View Follow-ups <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Card 3: Bookings This Week */}
          <div className="flex flex-col justify-between p-5 bg-[#0d1424] border border-slate-800/80 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Bookings This Week</span>
                <p className="text-[10px] text-slate-500 font-medium">Upcoming shoots and scheduled events.</p>
              </div>
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <CalendarRange className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{bookingsThisWeekCount}</h3>
              <button 
                onClick={() => navigateTo('projects')}
                className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer group-hover:translate-x-0.5 transform duration-200"
              >
                View Bookings <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Card 4: Pending Delivery Items */}
          <div className="flex flex-col justify-between p-5 bg-[#0d1424] border border-slate-800/80 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Pending Delivery Items</span>
                <p className="text-[10px] text-slate-500 font-medium">Photos, videos, albums, or files still pending.</p>
              </div>
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Layers className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{pendingDeliverablesCount}</h3>
              <button 
                onClick={() => navigateTo('deliverables')}
                className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors cursor-pointer group-hover:translate-x-0.5 transform duration-200"
              >
                View Delivery Items <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Card 5: Payments Pending */}
          <div className="flex flex-col justify-between p-5 bg-[#0d1424] border border-slate-800/80 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Payments Pending</span>
                <p className="text-[10px] text-slate-500 font-medium">Amount still to be collected from shoots.</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Banknote className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-xl font-extrabold text-white tracking-tight">{formatCurrencyINR(totalPaymentsPending)}</h3>
              <button 
                onClick={() => navigateTo('projects')}
                className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer group-hover:translate-x-0.5 transform duration-200"
              >
                View Bookings <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Card 6: Team On Leave */}
          <div className="flex flex-col justify-between p-5 bg-[#0d1424] border border-slate-800/80 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Team On Leave</span>
                <p className="text-[10px] text-slate-500 font-medium">People unavailable for event assignments.</p>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <UserX className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{teamOnLeaveCount}</h3>
              <button 
                onClick={() => navigateTo('employees')}
                className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer group-hover:translate-x-0.5 transform duration-200"
              >
                View Team Members <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule & Ops Split Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TodayEventsPanel
            events={todayEvents}
            onNavigateToEvents={() => navigateTo('events')}
          />
          <UpcomingEventsPanel events={upcomingEvents.slice(0, 5)} />
        </div>
        <div className="space-y-6">
          <DeliverablesOverview deliverables={deliverables} />
          <BackupRiskPanel backups={backups} projects={projects} />
        </div>
      </section>

      {/* Warnings & Conflicts Panel */}
      <ConflictWarningsPanel warnings={summary.warnings} />

      {/* Quick Action Navigation Grid */}
      <QuickActionsPanel onNavigate={navigateTo} />
    </main>
  );
};
