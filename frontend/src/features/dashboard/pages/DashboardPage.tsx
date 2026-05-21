import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardSummaryResponse } from '../types';
import { Activity, Users, Briefcase, Database, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatConflictTime } from '../../../lib/utils';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getSummary()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-slate-400 font-mono animate-pulse">Loading dashboard operations...</div>;
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Operations Hub</h2>
        <p className="text-slate-400 text-xs mt-1">Real-time status overview of clients, shoots, and media backups</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Clients</span>
            <h3 className="text-2xl font-heading font-extrabold text-white">{data?.stats.totalClients ?? 0}</h3>
          </div>
          <div className="p-3 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Projects</span>
            <h3 className="text-2xl font-heading font-extrabold text-white">{data?.stats.activeProjects ?? 0}</h3>
          </div>
          <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Upcoming Shoots</span>
            <h3 className="text-2xl font-heading font-extrabold text-white">{data?.stats.upcomingEventsCount ?? 0}</h3>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Safe Backups</span>
            <h3 className="text-2xl font-heading font-extrabold text-white">{data?.stats.successfulBackupsCount ?? 0}</h3>
          </div>
          <div className="p-3 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
            <Database className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Warnings & Checklists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Double Booking Alerts */}
        <section className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
          <div>
            <h3 className="text-white font-medium text-base">Scheduling Conflicts</h3>
            <p className="text-slate-500 text-xs mt-0.5">Crew double-bookings requiring reallocation</p>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {!data?.warnings.length ? (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4 text-emerald-400 text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>All employee schedules are clear. No double-bookings detected.</span>
              </div>
            ) : (
              data.warnings.map((warn, index) => (
                <div key={index} className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{warn.type}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{formatConflictTime(warn.conflictTime)}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Crew <strong className="text-white">{warn.employeeName}</strong> is assigned to both{' '}
                    <strong className="text-white">'{warn.eventTitle}'</strong> and{' '}
                    <strong className="text-white">'{warn.overlappingEventTitle}'</strong>.
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Backup Integrity Checklists */}
        <section className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
          <div>
            <h3 className="text-white font-medium text-base">Redundancy Warnings</h3>
            <p className="text-slate-500 text-xs mt-0.5">Deliverables logged with less than 2 independent backups</p>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {!data?.backupChecklists.length ? (
              <div className="bg-slate-900/60 rounded-lg p-4 text-slate-500 text-xs">
                No deliverables registered yet.
              </div>
            ) : (
              data.backupChecklists.map((check, index) => {
                const isLow = check.status === 'WARNING_LOW_REDUNDANCY';
                return (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border flex items-center justify-between gap-4 ${
                      isLow
                        ? 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                        : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-white font-semibold text-xs">{check.deliverableName}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Project: {check.projectName} | Backups: {check.redundantBackupCount}
                      </p>
                      <p className="text-[11px] text-slate-350">{check.details}</p>
                    </div>
                    <span
                      className={`text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isLow
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {check.status === 'WARNING_LOW_REDUNDANCY' ? 'Low Redundancy' : 'Safe'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
