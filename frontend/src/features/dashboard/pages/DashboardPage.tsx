import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { eventsApi } from '../../events/api/eventsApi';
import { projectsApi } from '../../projects/api/projectsApi';
import { deliverablesApi } from '../../deliverables/api/deliverablesApi';
import { backupsApi } from '../../backups/api/backupsApi';
import { useRouter } from '../../../app/router';

import type { DashboardSummaryResponse } from '../types';
import type { EventResponse } from '../../events/types';
import type { Project } from '../../projects/types';
import type { Deliverable } from '../../deliverables/types';
import type { BackupRecord } from '../../backups/types';

import { DashboardStatsCards } from '../components/DashboardStatsCards';
import { TodayEventsPanel } from '../components/TodayEventsPanel';
import { UpcomingEventsPanel } from '../components/UpcomingEventsPanel';
import { DeliverablesOverview } from '../components/DeliverablesOverview';
import { BackupRiskPanel } from '../components/BackupRiskPanel';
import { ConflictWarningsPanel } from '../components/ConflictWarningsPanel';
import { QuickActionsPanel } from '../components/QuickActionsPanel';

import { ShieldAlert, Sparkles } from 'lucide-react';

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

  const loading = loadingSummary || loadingEvents || loadingProjects || loadingDeliverables || loadingBackups;
  const error = isErrorSummary || isErrorEvents || isErrorProjects || isErrorDeliverables || isErrorBackups;

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['deliverables'] });
    queryClient.invalidateQueries({ queryKey: ['backups'] });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const todayEvents = events.filter((e) => e.eventDate === todayStr);
  const upcomingEvents = events
    .filter((e) => e.eventDate > todayStr)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.startTime.localeCompare(b.startTime));
  
  // Calculate dynamic stats
  const activeProjectsCount = projects.filter(
    (p) => p.status !== 'CANCELLED' && p.status !== 'ARCHIVED'
  ).length;

  const totalUpcomingEvents = events.filter(
    (e) => e.eventDate >= todayStr && e.status === 'SCHEDULED'
  ).length;

  const pendingDeliverablesCount = deliverables.filter(
    (d) => d.status !== 'COMPLETED' && d.status !== 'DELIVERED'
  ).length;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
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

      {/* KPI Cards Row */}
      <DashboardStatsCards
        totalProjects={activeProjectsCount}
        upcomingEventsCount={totalUpcomingEvents}
        pendingDeliverablesCount={pendingDeliverablesCount}
        backupIssuesCount={backupIssuesCount}
        conflictWarningsCount={conflictWarningsCount}
        onNavigate={navigateTo}
      />

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
