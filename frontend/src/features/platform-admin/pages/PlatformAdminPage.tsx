import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStudios,
  getPendingStudios,
  approveStudio,
  rejectStudio,
  suspendStudio,
  getPerformanceSummary,
  getTopEndpoints,
  getRecentErrors,
  getRecentSlowRequests
} from '../api/platformAdminApi';
import type { 
  PlatformStudioResponse,
  PerformanceSummary,
  TopEndpointsResponse,
  ApiRequestLogResponse
} from '../types';
import {
  Shield,
  Search,
  Check,
  X,
  AlertTriangle,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  CheckCircle2,
  Inbox,
  AlertCircle,
  Loader2,
  Activity,
  Cpu,
  Flame,
  Zap,
  Clock
} from 'lucide-react';

export const PlatformAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'performance'>('pending');
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track action in progress (approving/rejecting/suspending)
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Pending studios query (staleTime 30s)
  const { data: pendingStudios = [], isLoading: loadingPending, error: errorPending } = useQuery<PlatformStudioResponse[]>({
    queryKey: ['platform-admin-pending'],
    queryFn: () => getPendingStudios(),
    staleTime: 30000,
  });

  // All studios query (staleTime 30s)
  const { data: allStudios = [], isLoading: loadingAll, error: errorAll } = useQuery<PlatformStudioResponse[]>({
    queryKey: ['platform-admin-studios'],
    queryFn: () => getStudios(),
    staleTime: 30000,
  });

  // Performance Summary query (staleTime 30s)
  const { data: perfSummary, isLoading: loadingPerfSummary, isError: isErrorPerfSummary } = useQuery<PerformanceSummary>({
    queryKey: ['platform-admin-performance-summary'],
    queryFn: () => getPerformanceSummary(),
    staleTime: 30000,
    enabled: activeTab === 'performance',
  });

  // Top Endpoints query (staleTime 30s)
  const { data: topEndpoints = { byVolume: [], slowest: [] }, isLoading: loadingTopEndpoints } = useQuery<TopEndpointsResponse>({
    queryKey: ['platform-admin-performance-endpoints'],
    queryFn: () => getTopEndpoints(),
    staleTime: 30000,
    enabled: activeTab === 'performance',
  });

  // Recent Errors query (staleTime 30s)
  const { data: recentErrors = [], isLoading: loadingRecentErrors } = useQuery<ApiRequestLogResponse[]>({
    queryKey: ['platform-admin-performance-errors'],
    queryFn: () => getRecentErrors(),
    staleTime: 30000,
    enabled: activeTab === 'performance',
  });

  // Slow Requests query (staleTime 30s)
  const { data: slowRequests = [], isLoading: loadingSlowRequests } = useQuery<ApiRequestLogResponse[]>({
    queryKey: ['platform-admin-performance-slow'],
    queryFn: () => getRecentSlowRequests(),
    staleTime: 30000,
    enabled: activeTab === 'performance',
  });

  const loading = loadingPending || loadingAll || (activeTab === 'performance' && (loadingPerfSummary || loadingTopEndpoints || loadingRecentErrors || loadingSlowRequests));
  const error = errorPending ? (errorPending as any).message : errorAll ? (errorAll as any).message : isErrorPerfSummary ? 'Failed to fetch platform performance analytics.' : null;

  const loadData = () => {
    queryClient.invalidateQueries({ queryKey: ['platform-admin-pending'] });
    queryClient.invalidateQueries({ queryKey: ['platform-admin-studios'] });
    if (activeTab === 'performance') {
      queryClient.invalidateQueries({ queryKey: ['platform-admin-performance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['platform-admin-performance-endpoints'] });
      queryClient.invalidateQueries({ queryKey: ['platform-admin-performance-errors'] });
      queryClient.invalidateQueries({ queryKey: ['platform-admin-performance-slow'] });
    }
  };

  const handleApprove = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to approve studio "${name}"?`)) {
      return;
    }
    setProcessingId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await approveStudio(id);
      setActionSuccess(`Studio "${name}" approved successfully! Notification email sent.`);
      queryClient.invalidateQueries({ queryKey: ['platform-admin-pending'] });
      queryClient.invalidateQueries({ queryKey: ['platform-admin-studios'] });
    } catch (err: any) {
      setActionError(err.message || `Failed to approve studio "${name}".`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to reject beta request for "${name}"? (This will suspend the studio request)`)) {
      return;
    }
    setProcessingId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await rejectStudio(id);
      setActionSuccess(`Beta request for "${name}" has been rejected.`);
      queryClient.invalidateQueries({ queryKey: ['platform-admin-pending'] });
      queryClient.invalidateQueries({ queryKey: ['platform-admin-studios'] });
    } catch (err: any) {
      setActionError(err.message || `Failed to reject studio "${name}".`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSuspend = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to suspend studio "${name}"?`)) {
      return;
    }
    setProcessingId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await suspendStudio(id);
      setActionSuccess(`Studio "${name}" has been suspended.`);
      queryClient.invalidateQueries({ queryKey: ['platform-admin-pending'] });
      queryClient.invalidateQueries({ queryKey: ['platform-admin-studios'] });
    } catch (err: any) {
      setActionError(err.message || `Failed to suspend studio "${name}".`);
    } finally {
      setProcessingId(null);
    }
  };

  const filterStudios = (studios: PlatformStudioResponse[]) => {
    if (!searchTerm.trim()) return studios;
    const term = searchTerm.toLowerCase();
    return studios.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.slug && s.slug.toLowerCase().includes(term)) ||
        (s.ownerName && s.ownerName.toLowerCase().includes(term)) ||
        (s.ownerEmail && s.ownerEmail.toLowerCase().includes(term)) ||
        (s.phone && s.phone.toLowerCase().includes(term)) ||
        (s.country && s.country.toLowerCase().includes(term))
    );
  };

  const currentPendingList = filterStudios(pendingStudios);
  const currentAllList = filterStudios(allStudios);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25';
      case 'BETA_ACTIVE':
        return 'bg-teal-500/10 text-teal-400 border border-teal-500/25';
      case 'PENDING_APPROVAL':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/25';
      case 'SUSPENDED':
      case 'INACTIVE':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/25';
    }
  };

  const getPlanBadgeClass = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/25';
      case 'PRO':
        return 'bg-violet-500/10 text-violet-400 border border-violet-500/25';
      case 'STUDIO':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25';
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-violet-400 font-semibold tracking-wide text-xs uppercase font-mono">
            <Shield className="h-4 w-4" />
            <span>StudioOps Platform Console</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">
            Platform Administration
          </h2>
          <p className="text-slate-400 text-xs">
            Review applicant signups, manage active workspaces, and monitor subscription status.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading || processingId !== null}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-medium text-xs px-4 py-2.5 rounded-lg border border-slate-700/60 shadow transition-colors cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Global Success / Error Messages */}
      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
          <button
            onClick={() => setActionSuccess(null)}
            className="ml-auto text-emerald-400 hover:text-emerald-350 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in text-xs font-medium">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="ml-auto text-rose-400 hover:text-rose-350 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-5 rounded-xl flex flex-col md:flex-row items-center gap-4 text-xs">
          <AlertTriangle className="h-6 w-6 text-rose-500 flex-shrink-0" />
          <div className="space-y-1 text-center md:text-left flex-1">
            <h4 className="font-semibold text-slate-200">Connection Failed</h4>
            <p className="text-slate-400">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            Retry Fetch
          </button>
        </div>
      )}

      {/* Filter and Tab Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-4">
        {/* Tabs */}
        <div className="flex bg-[#0d1424] border border-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('pending');
              setActionError(null);
              setActionSuccess(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-450 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>Pending Requests</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                activeTab === 'pending'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {pendingStudios.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('all');
              setActionError(null);
              setActionSuccess(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-450 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>All Workspace Studios</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                activeTab === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {allStudios.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('performance');
              setActionError(null);
              setActionSuccess(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'performance'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-450 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Performance</span>
          </button>
        </div>

        {/* Search */}
        {activeTab !== 'performance' && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, owner, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0d1424] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-550 focus:outline-none focus:border-violet-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!loading && (
        <div className="animate-fade-in">
          {activeTab === 'pending' ? (
            /* Tab: Pending Requests */
            currentPendingList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center bg-[#0d1424] border border-slate-800/80 rounded-2xl">
                {pendingStudios.length === 0 ? (
                  <>
                    <div className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading font-semibold text-slate-200 text-sm">Inbox Cleared</h3>
                    <p className="text-slate-550 text-xs mt-1 max-w-sm">
                      There are no pending beta requests at this time. All submissions have been processed!
                    </p>
                  </>
                ) : (
                  <>
                    <Search className="h-10 w-10 text-slate-650 mb-3" />
                    <p className="text-slate-400 text-sm">No requests match search filters</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-violet-400 hover:text-violet-350 text-xs font-semibold mt-2 cursor-pointer"
                    >
                      Clear search query
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentPendingList.map((studio) => (
                  <div
                    key={studio.id}
                    className="bg-[#0d1424] border border-slate-800/80 hover:border-slate-700 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 flex flex-col justify-between"
                  >
                    {/* Card Body */}
                    <div className="p-6 space-y-5">
                      {/* Name / Slug Header */}
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/50">
                        <div className="space-y-1">
                          <h3 className="font-heading font-bold text-white text-base leading-snug">
                            {studio.name}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-450 uppercase tracking-wider block bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                            slug: {studio.slug}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            PENDING BETA
                          </span>
                          <span className="text-[9px] text-slate-500 flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3" />
                            {formatDate(studio.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Detail Parameters */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-350">
                            <User className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                            <div className="truncate">
                              <span className="text-[10px] text-slate-500 block">Owner Name</span>
                              <span className="font-medium text-slate-200 block truncate">{studio.ownerName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-slate-350">
                            <Mail className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                            <div className="truncate">
                              <span className="text-[10px] text-slate-500 block">Email Address</span>
                              <a
                                href={`mailto:${studio.ownerEmail}`}
                                className="font-medium text-violet-400 hover:underline block truncate"
                              >
                                {studio.ownerEmail}
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-350">
                            <Phone className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                            <div className="truncate">
                              <span className="text-[10px] text-slate-500 block">Phone Number</span>
                              <span className="font-medium text-slate-200 block truncate">{studio.phone || 'None'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-slate-350">
                            <Globe className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                            <div className="truncate">
                              <span className="text-[10px] text-slate-500 block">Country</span>
                              <span className="font-medium text-slate-200 block truncate">{studio.country || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleReject(studio.id, studio.name)}
                        disabled={processingId !== null}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-450 font-semibold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject Request</span>
                      </button>
                      <button
                        onClick={() => handleApprove(studio.id, studio.name)}
                        disabled={processingId !== null}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {processingId === studio.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        <span>Approve Beta</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'all' ? (
            /* Tab: All Studios directory list */
            currentAllList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center bg-[#0d1424] border border-slate-800/80 rounded-2xl">
                <Search className="h-10 w-10 text-slate-655 mb-3" />
                <p className="text-slate-400 text-sm">No studios match your filter query</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-violet-400 hover:text-violet-350 text-xs font-semibold mt-2 cursor-pointer"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-850 bg-slate-900/30 text-slate-450 uppercase font-mono font-bold tracking-wider">
                        <th className="px-6 py-3.5">Studio Details</th>
                        <th className="px-6 py-3.5">Owner Profile</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                        <th className="px-6 py-3.5 text-center">Subscription Plan</th>
                        <th className="px-6 py-3.5 text-center">Lifecycle Status</th>
                        <th className="px-6 py-3.5 text-center">Registration</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60">
                      {currentAllList.map((studio) => (
                        <tr key={studio.id} className="hover:bg-slate-900/20 transition-colors">
                          {/* Studio Details column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 max-w-[200px]">
                              <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Building2 className="h-4 w-4" />
                              </div>
                              <div className="truncate">
                                <span className="font-semibold text-white block truncate">{studio.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono block truncate">/{studio.slug}</span>
                              </div>
                            </div>
                          </td>

                          {/* Owner Profile column */}
                          <td className="px-6 py-4">
                            <div className="truncate max-w-[220px]">
                              <span className="font-medium text-slate-200 block truncate">{studio.ownerName}</span>
                              <a
                                href={`mailto:${studio.ownerEmail}`}
                                className="text-[11px] text-violet-400 hover:underline block truncate"
                              >
                                {studio.ownerEmail}
                              </a>
                              {studio.phone && (
                                <span className="text-[10px] text-slate-500 block truncate">{studio.phone}</span>
                              )}
                            </div>
                          </td>

                          {/* Status Badge column */}
                          <td className="px-6 py-4 text-center">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${getStatusBadgeClass(
                                    studio.status
                                )}`}
                            >
                              {studio.status}
                            </span>
                          </td>

                          {/* Subscription Plan column */}
                          <td className="px-6 py-4 text-center">
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${getPlanBadgeClass(
                                    studio.subscriptionPlan
                                )}`}
                            >
                              {studio.subscriptionPlan || 'FREE'}
                            </span>
                          </td>

                          {/* Subscription Status column */}
                          <td className="px-6 py-4 text-center">
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                                    studio.subscriptionStatus === 'ACTIVE' || studio.subscriptionStatus === 'TRIAL'
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                }`}
                            >
                              {studio.subscriptionStatus || 'N/A'}
                            </span>
                          </td>

                          {/* Creation Date column */}
                          <td className="px-6 py-4 text-center text-slate-450 font-mono text-[11px]">
                            {formatDate(studio.createdAt)}
                          </td>

                          {/* Actions column */}
                          <td className="px-6 py-4 text-right">
                            {studio.status === 'ACTIVE' || studio.status === 'BETA_ACTIVE' ? (
                              <button
                                onClick={() => handleSuspend(studio.id, studio.name)}
                                disabled={processingId !== null}
                                className="px-2.5 py-1 text-[11px] font-semibold border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 rounded transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApprove(studio.id, studio.name)}
                                disabled={processingId !== null}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {processingId === studio.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                                ) : (
                                  'Approve'
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            /* Tab: Performance Observability Metrics */
            <div className="space-y-6">
              {/* Header and status */}
              <div className="flex items-center justify-between bg-slate-900/20 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-violet-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">System Health</h3>
                    <p className="text-[10px] text-slate-400">Real-time database connection status</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">DB Connection:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold font-mono ${
                    perfSummary?.dbHealth === 'UP'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {perfSummary?.dbHealth || 'UNKNOWN'}
                  </span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-slate-550">
                    <span className="text-[10px] uppercase font-mono tracking-wider">Requests (Today)</span>
                    <Cpu className="h-4 w-4 text-violet-500" />
                  </div>
                  <p className="text-xl font-bold text-white font-mono">{perfSummary?.totalRequestsToday ?? 0}</p>
                </div>
                <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-slate-550">
                    <span className="text-[10px] uppercase font-mono tracking-wider">Avg Latency</span>
                    <Clock className="h-4 w-4 text-indigo-500" />
                  </div>
                  <p className="text-xl font-bold text-white font-mono">{(perfSummary?.averageResponseMsToday ?? 0).toFixed(0)} ms</p>
                </div>
                <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-slate-550">
                    <span className="text-[10px] uppercase font-mono tracking-wider">p95 Latency</span>
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-xl font-bold text-white font-mono">{(perfSummary?.p95ResponseMsToday ?? 0).toFixed(0)} ms</p>
                </div>
                <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-slate-550">
                    <span className="text-[10px] uppercase font-mono tracking-wider">Errors (Today)</span>
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                  </div>
                  <p className="text-xl font-bold text-rose-500 font-mono">{perfSummary?.errorCountToday ?? 0}</p>
                </div>
                <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4 space-y-2 col-span-2 lg:col-span-1">
                  <div className="flex justify-between items-center text-slate-550">
                    <span className="text-[10px] uppercase font-mono tracking-wider">Slow Requests</span>
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-xl font-bold text-orange-400 font-mono">{perfSummary?.slowRequestCountToday ?? 0}</p>
                </div>
              </div>

              {/* Endpoints breakdown */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Top by Volume */}
                <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-350 font-mono">Top Endpoints by Volume (24h)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-555 uppercase font-mono">
                          <th className="pb-2 font-bold">Method</th>
                          <th className="pb-2 font-bold">Path</th>
                          <th className="pb-2 font-bold text-right">Volume</th>
                          <th className="pb-2 font-bold text-right">Avg Latency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/40">
                        {topEndpoints.byVolume.length === 0 ? (
                          <tr><td colSpan={4} className="py-4 text-center text-slate-500">No requests in past 24 hours</td></tr>
                        ) : topEndpoints.byVolume.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/10">
                            <td className="py-2.5 font-mono font-bold text-violet-400">{item.method}</td>
                            <td className="py-2.5 font-mono text-slate-300 max-w-[200px] truncate">{item.path}</td>
                            <td className="py-2.5 text-right font-mono">{item.requestCount}</td>
                            <td className="py-2.5 text-right font-mono">{item.avgDurationMs.toFixed(0)} ms</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Slowest */}
                <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-350 font-mono">Slowest Endpoints (24h)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-555 uppercase font-mono">
                          <th className="pb-2 font-bold">Method</th>
                          <th className="pb-2 font-bold">Path</th>
                          <th className="pb-2 font-bold text-right">Volume</th>
                          <th className="pb-2 font-bold text-right">Avg Latency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/40">
                        {topEndpoints.slowest.length === 0 ? (
                          <tr><td colSpan={4} className="py-4 text-center text-slate-500">No requests in past 24 hours</td></tr>
                        ) : topEndpoints.slowest.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/10">
                            <td className="py-2.5 font-mono font-bold text-violet-400">{item.method}</td>
                            <td className="py-2.5 font-mono text-slate-300 max-w-[200px] truncate">{item.path}</td>
                            <td className="py-2.5 text-right font-mono">{item.requestCount}</td>
                            <td className="py-2.5 text-right font-mono font-bold text-orange-400">{item.avgDurationMs.toFixed(0)} ms</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recent Errors */}
              <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-rose-500 font-mono">Recent Logged Errors (Last 20)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-555 uppercase font-mono">
                        <th className="pb-2 font-bold">Time</th>
                        <th className="pb-2 font-bold">Request</th>
                        <th className="pb-2 font-bold text-center">Status</th>
                        <th className="pb-2 font-bold">User</th>
                        <th className="pb-2 font-bold">Error Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/40">
                      {recentErrors.length === 0 ? (
                        <tr><td colSpan={5} className="py-4 text-center text-slate-500">No errors logged</td></tr>
                      ) : recentErrors.map((logItem) => (
                        <tr key={logItem.id} className="hover:bg-slate-900/10">
                          <td className="py-2.5 font-mono text-slate-400 whitespace-nowrap">{formatDate(logItem.createdAt)} {new Date(logItem.createdAt).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</td>
                          <td className="py-2.5 font-mono text-slate-300 whitespace-nowrap">
                            <span className="font-bold text-violet-400 mr-2">{logItem.method}</span>
                            <span>{logItem.path}</span>
                          </td>
                          <td className="py-2.5 text-center font-mono font-bold text-rose-500">{logItem.statusCode}</td>
                          <td className="py-2.5 text-slate-300 truncate max-w-[150px]">{logItem.userEmail || 'anonymous'}</td>
                          <td className="py-2.5 text-rose-400 max-w-[300px] truncate" title={logItem.errorMessage || ''}>{logItem.errorMessage || 'Unknown Error'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Slow Requests */}
              <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-orange-450 font-mono">Recent Slow Requests &gt;1000ms (Last 20)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-555 uppercase font-mono">
                        <th className="pb-2 font-bold">Time</th>
                        <th className="pb-2 font-bold">Request</th>
                        <th className="pb-2 font-bold text-right">Duration</th>
                        <th className="pb-2 font-bold">User</th>
                        <th className="pb-2 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/40">
                      {slowRequests.length === 0 ? (
                        <tr><td colSpan={5} className="py-4 text-center text-slate-500">No slow requests detected</td></tr>
                      ) : slowRequests.map((logItem) => (
                        <tr key={logItem.id} className="hover:bg-slate-900/10">
                          <td className="py-2.5 font-mono text-slate-400 whitespace-nowrap">{formatDate(logItem.createdAt)} {new Date(logItem.createdAt).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</td>
                          <td className="py-2.5 font-mono text-slate-300 whitespace-nowrap">
                            <span className="font-bold text-violet-400 mr-2">{logItem.method}</span>
                            <span>{logItem.path}</span>
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-orange-400">{logItem.durationMs} ms</td>
                          <td className="py-2.5 text-slate-300 truncate max-w-[150px]">{logItem.userEmail || 'anonymous'}</td>
                          <td className="py-2.5 text-center font-mono text-slate-400">{logItem.statusCode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="h-4 bg-slate-800 w-1/3 rounded animate-pulse" />
            <div className="h-10 bg-slate-900 w-full rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl h-56 animate-pulse" />
            <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl h-56 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};
