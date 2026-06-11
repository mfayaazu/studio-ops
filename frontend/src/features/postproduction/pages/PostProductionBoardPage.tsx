import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { postproductionApi } from '../api/postproductionApi';
import { fetchEmployees } from '../../employees/api/employeesApi';
import { fetchProjects } from '../../projects/api/projectsApi';
import { fetchDeliverables } from '../../deliverables/api/deliverablesApi';
import { formatHours } from '../../../lib/formatters';
import type {
  PostProductionTask,
  PostProductionTaskStatus,
  PostProductionTaskType
} from '../types';
import type { Employee } from '../../employees/types';
import type { Project } from '../../projects/types';
import type { Deliverable } from '../../deliverables/types';
import { PostProductionKanbanBoard } from '../components/PostProductionKanbanBoard';
import { PostProductionTaskDrawer, getTaskTypeLabel } from '../components/PostProductionTaskDrawer';
import {
  Sparkles,
  Loader2,
  Layers,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Clock,
  RefreshCw,
  LayoutGrid,
  Search,
  X,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const TASK_TYPES: PostProductionTaskType[] = [
  'PHOTO_CULLING',
  'PHOTO_EDITING',
  'VIDEO_EDITING',
  'COLOR_GRADING',
  'AUDIO_SYNC',
  'ALBUM_DESIGN',
  'QUALITY_CHECK',
  'EXPORT_UPLOAD',
  'CLIENT_REVISION',
  'OTHER'
];

const PRIORITY_WEIGHTS: Record<string, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export const PostProductionBoardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [nameLookupWarning, setNameLookupWarning] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null);
  
  // A simple counter to trigger child card subtask updates when checklist changes
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [showInsights, setShowInsights] = useState<boolean>(() => {
    return localStorage.getItem('studioops.postproduction.insights.visible') === 'true';
  });

  const [showFilters, setShowFilters] = useState<boolean>(() => {
    return localStorage.getItem('studioops.postproduction.filters.visible') === 'true';
  });

  const [isCompact, setIsCompact] = useState<boolean>(() => {
    return localStorage.getItem('studioops.postproduction.compact.visible') === 'true';
  });

  const handleToggleCompact = () => {
    setIsCompact(prev => {
      const next = !prev;
      localStorage.setItem('studioops.postproduction.compact.visible', String(next));
      return next;
    });
  };

  // Filter & Sort States
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterTaskType, setFilterTaskType] = useState<string>('ALL');
  const [filterDueDate, setFilterDueDate] = useState<string>('ALL');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterDeliverable, setFilterDeliverable] = useState<string>('ALL');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('WORKFLOW_INDEX');

  // Queries
  const { data: tasks = [], isLoading: loadingTasks, error: errorTasks } = useQuery<PostProductionTask[]>({
    queryKey: ['postproduction', 'tasks'],
    queryFn: () => postproductionApi.fetchTasks(),
    staleTime: 60000,
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => fetchEmployees().catch((e) => {
      console.error('[PostProd] Failed to fetch employees:', e?.message || e);
      setNameLookupWarning(true);
      return [] as Employee[];
    }),
    staleTime: 60000,
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => fetchProjects().catch((e) => {
      console.error('[PostProd] Failed to fetch projects:', e?.message || e);
      setNameLookupWarning(true);
      return [] as Project[];
    }),
    staleTime: 60000,
  });

  const { data: deliverables = [], isLoading: loadingDeliverables } = useQuery<Deliverable[]>({
    queryKey: ['deliverables'],
    queryFn: () => fetchDeliverables().catch((e) => {
      console.error('[PostProd] Failed to fetch deliverables:', e?.message || e);
      setNameLookupWarning(true);
      return [] as Deliverable[];
    }),
    staleTime: 60000,
  });

  const loading = loadingTasks || loadingEmployees || loadingProjects || loadingDeliverables;
  const apiStatus = errorTasks
    ? 'offline'
    : tasks.length === 0
    ? 'empty'
    : 'connected';

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getIn7DaysStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredTasks = tasks.filter((task) => {
    // 1. Search
    if (filterSearch.trim() !== '') {
      const searchLower = filterSearch.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDesc = task.description?.toLowerCase().includes(searchLower) || false;
      if (!matchesTitle && !matchesDesc) return false;
    }

    // 2. Assignee
    if (filterAssignee !== 'ALL') {
      if (filterAssignee === 'UNASSIGNED') {
        if (task.assignedEmployeeId) return false;
      } else {
        if (task.assignedEmployeeId !== filterAssignee) return false;
      }
    }

    // 3. Priority
    if (filterPriority !== 'ALL') {
      if (task.priority !== filterPriority) return false;
    }

    // 4. Task Type
    if (filterTaskType !== 'ALL') {
      if (task.taskType !== filterTaskType) return false;
    }

    // 5. Due Date
    if (filterDueDate !== 'ALL') {
      const todayStr = getTodayStr();
      const in7DaysStr = getIn7DaysStr();
      
      if (filterDueDate === 'NONE') {
        if (task.dueDate) return false;
      } else if (filterDueDate === 'OVERDUE') {
        if (!task.dueDate || task.dueDate >= todayStr || task.status === 'DONE') return false;
      } else if (filterDueDate === 'TODAY') {
        if (task.dueDate !== todayStr) return false;
      } else if (filterDueDate === 'WEEK') {
        if (!task.dueDate || task.dueDate < todayStr || task.dueDate > in7DaysStr) return false;
      }
    }

    // 6. Project
    if (filterProject !== 'ALL') {
      if (task.projectId !== filterProject) return false;
    }

    // 7. Deliverable
    if (filterDeliverable !== 'ALL') {
      if (task.deliverableId !== filterDeliverable) return false;
    }

    return true;
  });

  const sortedAndFilteredTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'WORKFLOW_INDEX':
        return (a.sortOrder || 0) - (b.sortOrder || 0);

      case 'DUE_ASC': {
        if (!a.dueDate && !b.dueDate) return (a.sortOrder || 0) - (b.sortOrder || 0);
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }

      case 'DUE_DESC': {
        if (!a.dueDate && !b.dueDate) return (a.sortOrder || 0) - (b.sortOrder || 0);
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      }

      case 'PRIORITY': {
        const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
        const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
        if (weightA !== weightB) {
          return weightB - weightA;
        }
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      }

      case 'RECENTLY_UPDATED': {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      }

      case 'TITLE_AZ':
        return a.title.localeCompare(b.title);

      default:
        return 0;
    }
  });

  const activeFilterCount =
    (filterAssignee !== 'ALL' ? 1 : 0) +
    (filterPriority !== 'ALL' ? 1 : 0) +
    (filterTaskType !== 'ALL' ? 1 : 0) +
    (filterDueDate !== 'ALL' ? 1 : 0) +
    (filterProject !== 'ALL' ? 1 : 0) +
    (filterDeliverable !== 'ALL' ? 1 : 0) +
    (filterSearch.trim() !== '' ? 1 : 0);

  const clearAllFilters = () => {
    setFilterAssignee('ALL');
    setFilterPriority('ALL');
    setFilterTaskType('ALL');
    setFilterDueDate('ALL');
    setFilterProject('ALL');
    setFilterDeliverable('ALL');
    setFilterSearch('');
  };

  const handleTaskClick = (task: PostProductionTask) => {
    setSelectedTaskId(task.id);
  };

  const handleStatusUpdated = async (taskId: string, newStatus: PostProductionTaskStatus) => {
    // Optimistic status update in state cache
    const previousTasks = queryClient.getQueryData<PostProductionTask[]>(['postproduction', 'tasks']);
    if (previousTasks) {
      queryClient.setQueryData<PostProductionTask[]>(
        ['postproduction', 'tasks'],
        previousTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    }
    queryClient.invalidateQueries({ queryKey: ['postproduction', 'tasks'] });
  };

  const handleMoveTaskStatus = async (taskId: string, newStatus: PostProductionTaskStatus) => {
    setPageError(null);
    const previousTasks = queryClient.getQueryData<PostProductionTask[]>(['postproduction', 'tasks']);

    // Optimistic status update in state cache
    if (previousTasks) {
      queryClient.setQueryData<PostProductionTask[]>(
        ['postproduction', 'tasks'],
        previousTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    }

    try {
      await postproductionApi.moveTaskStatus(taskId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['postproduction', 'tasks'] });
    } catch (err: any) {
      console.error('Failed to move task status:', err);
      // Rollback on failure
      if (previousTasks) {
        queryClient.setQueryData(['postproduction', 'tasks'], previousTasks);
      }
      setPageError(err?.message || 'Failed to update task status. Reverting changes.');
    }
  };

  const handleTaskUpdated = async () => {
    queryClient.invalidateQueries({ queryKey: ['postproduction', 'tasks'] });
  };

  const handleSubtasksUpdated = () => {
    // Increment trigger to prompt cards to re-fetch their subtask counts
    setRefreshTrigger((prev) => prev + 1);
  };

  // Find currently selected task details
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  // Stats Aggregations
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((t) => t.status !== 'DONE').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'CHANGES_REQUESTED').length;
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED').length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;

  const totalEstHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalActHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

  const formattedToday = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="space-y-4 pb-12">
      {/* Header and Welcome Section */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-heading font-extrabold text-white tracking-wide uppercase">
            Post-Production Center
          </h2>
          <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
          <span className="text-[10px] text-slate-500 font-mono font-normal">({formattedToday})</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-[9px] font-bold text-violet-400">
          <LayoutGrid className="h-3.5 w-3.5" />
          Post-production Board
        </div>
      </div>

      {/* KPI Stats Cards */}
      {showInsights && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-fadeIn">
          {/* Total / Active */}
          <div className="bg-[#0b1222]/40 border border-slate-800/60 rounded-xl p-3 space-y-1 shadow-md">
            <div className="flex justify-between items-center text-slate-550">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Tasks</span>
              <Layers className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono">{activeTasks}</h3>
              <p className="text-[9px] text-slate-500 font-semibold">Total: {totalTasks} backlog</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-[#0b1222]/40 border border-slate-800/60 rounded-xl p-3 space-y-1 shadow-md">
            <div className="flex justify-between items-center text-slate-550">
              <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
              <Activity className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono">{inProgressTasks}</h3>
              <p className="text-[9px] text-slate-500 font-semibold">Active workflow</p>
            </div>
          </div>

          {/* Blocked */}
          <div className="bg-[#0b1222]/40 border border-slate-800/60 rounded-xl p-3 space-y-1 shadow-md">
            <div className="flex justify-between items-center text-slate-550">
              <span className="text-[10px] font-bold uppercase tracking-wider">Blocked</span>
              <AlertOctagon className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono">{blockedTasks}</h3>
              <p className="text-[9px] text-slate-500 font-semibold">Requires PM action</p>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-[#0b1222]/40 border border-slate-800/60 rounded-xl p-3 space-y-1 shadow-md">
            <div className="flex justify-between items-center text-slate-550">
              <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono">{completedTasks}</h3>
              <p className="text-[9px] text-slate-500 font-semibold">Ready to deliver</p>
            </div>
          </div>

          {/* Hours Logged */}
          <div className="bg-[#0b1222]/40 border border-slate-800/60 rounded-xl p-3 space-y-1 shadow-md">
            <div className="flex justify-between items-center text-slate-555">
              <span className="text-[10px] font-bold uppercase tracking-wider">Hours Logged</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono">
                {formatHours(totalActHours)} <span className="text-xs text-slate-500 font-bold font-sans">/ {formatHours(totalEstHours)}</span>
              </h3>
              <p className="text-[9px] text-slate-500 font-semibold">Effort log ratios</p>
            </div>
          </div>
        </div>
      )}

      {nameLookupWarning && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-between gap-2 text-xs font-sans font-semibold">
          <span>Note: Some entity name lookups failed. Displaying short UUIDs instead.</span>
          <button
            onClick={() => setNameLookupWarning(false)}
            className="text-[10px] text-slate-500 hover:text-slate-350 uppercase tracking-wider font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {pageError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl flex items-center justify-between gap-2 text-xs font-sans font-semibold">
          <span>Error: {pageError}</span>
          <button
            onClick={() => setPageError(null)}
            className="text-[10px] text-slate-500 hover:text-slate-350 uppercase tracking-wider font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Toolbar */}
      {apiStatus !== 'offline' && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#090f1e]/60 border border-slate-800/50 rounded-xl p-1.5 shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowFilters(prev => {
                    const next = !prev;
                    localStorage.setItem('studioops.postproduction.filters.visible', String(next));
                    return next;
                  });
                }}
                className={`px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  showFilters
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search & Filters</span>
                {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              <button
                onClick={() => {
                  setShowInsights(prev => {
                    const next = !prev;
                    localStorage.setItem('studioops.postproduction.insights.visible', String(next));
                    return next;
                  });
                }}
                className={`px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  showInsights
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Insights</span>
                {showInsights ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleCompact}
                className={`px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isCompact 
                    ? 'bg-violet-600 border-violet-500 text-white font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Compact Cards</span>
              </button>

              <button
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['postproduction', 'tasks'] });
                  queryClient.invalidateQueries({ queryKey: ['employees'] });
                  queryClient.invalidateQueries({ queryKey: ['projects'] });
                  queryClient.invalidateQueries({ queryKey: ['deliverables'] });
                }}
                disabled={loading}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-lg text-xs font-semibold transition-all border border-slate-750 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Refresh Board Data"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Collapsible Search and Filters panel */}
          {showFilters && (
            <div className="bg-[#0b1222]/40 border border-slate-800/60 rounded-xl p-3 shadow-md space-y-3 animate-fadeIn">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-2 border-b border-slate-800/30">
                {/* Search bar */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search tasks by title or description..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="w-full pl-8 pr-8 py-1 bg-[#070b14] border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg text-[11px] transition-colors outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {filterSearch && (
                    <button
                      onClick={() => setFilterSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-355 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort & Clear */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Sort By</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#070b14] border border-slate-800 text-slate-350 hover:text-white rounded p-1 text-[11px] transition-colors outline-none focus:ring-1 focus:ring-violet-500/50"
                  >
                    <option value="WORKFLOW_INDEX">Workflow Index</option>
                    <option value="DUE_ASC">Due Date Ascending</option>
                    <option value="DUE_DESC">Due Date Descending</option>
                    <option value="PRIORITY">Priority (Highest First)</option>
                    <option value="RECENTLY_UPDATED">Recently Updated</option>
                    <option value="TITLE_AZ">Task Title A-Z</option>
                  </select>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 rounded text-[11px] font-semibold transition-all border border-slate-750 flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter selects row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[10px]">
                {/* Assignee Filter */}
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Assignee</label>
                  <select
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 text-slate-350 hover:text-white rounded p-1 text-[11px] focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="ALL">All Assignees</option>
                    <option value="UNASSIGNED">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 text-slate-350 hover:text-white rounded p-1 text-[11px] focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                {/* Task Type Filter */}
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Task Type</label>
                  <select
                    value={filterTaskType}
                    onChange={(e) => setFilterTaskType(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 text-slate-350 hover:text-white rounded p-1 text-[11px] focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="ALL">All Task Types</option>
                    {TASK_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {getTaskTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date Filter */}
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Due Date</label>
                  <select
                    value={filterDueDate}
                    onChange={(e) => setFilterDueDate(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 text-slate-350 hover:text-white rounded p-1 text-[11px] focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="ALL">All Due Dates</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="TODAY">Due Today</option>
                    <option value="WEEK">Due This Week</option>
                    <option value="NONE">No Due Date</option>
                  </select>
                </div>

                {/* Project Filter */}
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Project</label>
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 text-slate-350 hover:text-white rounded p-1 text-[11px] focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="ALL">All Projects</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deliverable Filter */}
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Deliverable</label>
                  <select
                    value={filterDeliverable}
                    onChange={(e) => setFilterDeliverable(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 text-slate-350 hover:text-white rounded p-1 text-[11px] focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="ALL">All Deliverables</option>
                    {deliverables.map((del) => (
                      <option key={del.id} value={del.id}>
                        {del.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Board & Connection Status header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Production Board Pipeline
        </h3>
        <div>
          {apiStatus === 'connected' && (
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Backend Online: Connected
            </span>
          )}
          {apiStatus === 'empty' && (
            <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              No production data found
            </span>
          )}
          {apiStatus === 'offline' && (
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Backend Offline
            </span>
          )}
        </div>
      </div>

      {/* Primary Content Container */}
      <div className="w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-[#0b1222]/30 border border-slate-800/40 rounded-2xl">
            <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
            <span className="text-slate-400 text-xs font-semibold">Loading Kanban tasks...</span>
          </div>
        ) : apiStatus === 'offline' ? (
          /* Offline state */
          <div className="flex flex-col items-center justify-center py-20 bg-rose-500/5 border border-dashed border-rose-500/20 rounded-2xl text-center space-y-3">
            <AlertOctagon className="h-10 w-10 text-rose-500 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-205">Post-production backend is unavailable.</h4>
              <p className="text-xs text-slate-500">Failed to connect to the backend server. Please verify the service is running and try again.</p>
            </div>
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['postproduction', 'tasks'] });
                queryClient.invalidateQueries({ queryKey: ['employees'] });
                queryClient.invalidateQueries({ queryKey: ['projects'] });
                queryClient.invalidateQueries({ queryKey: ['deliverables'] });
              }}
              className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold transition-colors border border-rose-500/20 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : apiStatus === 'empty' ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl text-center space-y-2">
            <LayoutGrid className="h-10 w-10 text-slate-650" />
            <h4 className="text-sm font-bold text-slate-300">No post-production tasks yet.</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Use the backend migration or seed scripts to populate post-production tasks for this studio.
            </p>
          </div>
        ) : sortedAndFilteredTasks.length === 0 ? (
          /* Filtered empty state */
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl text-center space-y-4">
            <div className="p-3 bg-slate-850/50 rounded-full text-slate-400 border border-slate-800">
              <Layers className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">No matching tasks found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No post-production tasks match your current filter criteria. Try adjusting or clearing your filters.
              </p>
            </div>
            <button
              onClick={clearAllFilters}
              className="py-1.5 px-4 bg-violet-600 hover:bg-violet-750 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Connected State - Board with filtered and sorted tasks */
          <PostProductionKanbanBoard
            tasks={sortedAndFilteredTasks}
            employees={employees}
            projects={projects}
            deliverables={deliverables}
            onTaskClick={handleTaskClick}
            refreshTrigger={refreshTrigger}
            onDropTask={handleMoveTaskStatus}
            onTaskUpdated={handleTaskUpdated}
            isCompact={isCompact}
          />
        )}
      </div>

      {/* Task detail drawer overlay */}
      <PostProductionTaskDrawer
        task={selectedTask}
        isOpen={selectedTaskId !== null}
        onClose={() => setSelectedTaskId(null)}
        employees={employees}
        projects={projects}
        deliverables={deliverables}
        onStatusUpdated={handleStatusUpdated}
        onSubtasksUpdated={handleSubtasksUpdated}
        onTaskUpdated={handleTaskUpdated}
      />
    </main>
  );
};
export default PostProductionBoardPage;
