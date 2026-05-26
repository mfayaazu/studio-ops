import React, { useState, useEffect } from 'react';
import type {
  PostProductionTask,
  PostProductionTaskStatus,
  PostProductionTaskPriority,
  PostProductionTaskType
} from '../types';
import { postproductionApi } from '../api/postproductionApi';
import { SubtaskChecklist } from './SubtaskChecklist';
import type { Employee } from '../../employees/types';
import type { Project } from '../../projects/types';
import type { Deliverable } from '../../deliverables/types';
import {
  X,
  Loader2,
  Briefcase,
  Layers,
  User,
  ChevronRight,
  CheckCircle2,
  AlertOctagon,
  HelpCircle
} from 'lucide-react';

interface PostProductionTaskDrawerProps {
  task: PostProductionTask | null;
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  projects: Project[];
  deliverables: Deliverable[];
  onStatusUpdated: (taskId: string, newStatus: PostProductionTaskStatus) => void;
  onSubtasksUpdated?: () => void;
  onTaskUpdated?: () => void;
}

export const getStatusLabel = (status: PostProductionTaskStatus): string => {
  switch (status) {
    case 'BACKLOG': return 'Backlog';
    case 'TODO': return 'To Do';
    case 'IN_PROGRESS': return 'In Progress';
    case 'IN_REVIEW': return 'In Review';
    case 'CHANGES_REQUESTED': return 'Changes Requested';
    case 'DONE': return 'Completed';
    case 'BLOCKED': return 'Blocked';
    default: return status;
  }
};

export const getStatusColorClass = (status: PostProductionTaskStatus): string => {
  switch (status) {
    case 'BACKLOG': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    case 'TODO': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'IN_PROGRESS': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    case 'IN_REVIEW': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'CHANGES_REQUESTED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'DONE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'BLOCKED': return 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse';
    default: return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};

export const getPriorityColorClass = (priority: PostProductionTaskPriority): string => {
  switch (priority) {
    case 'LOW': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'URGENT': return 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold';
    default: return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};

export const getTaskTypeLabel = (type: string): string => {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getNextStatus = (current: PostProductionTaskStatus): PostProductionTaskStatus | null => {
  switch (current) {
    case 'BACKLOG': return 'TODO';
    case 'TODO': return 'IN_PROGRESS';
    case 'IN_PROGRESS': return 'IN_REVIEW';
    case 'IN_REVIEW': return 'DONE';
    case 'CHANGES_REQUESTED': return 'IN_PROGRESS';
    default: return null;
  }
};

export const PostProductionTaskDrawer: React.FC<PostProductionTaskDrawerProps> = ({
  task,
  isOpen,
  onClose,
  employees,
  projects,
  deliverables,
  onStatusUpdated,
  onSubtasksUpdated,
  onTaskUpdated
}) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);

  const [localTitle, setLocalTitle] = useState<string>('');
  const [localDescription, setLocalDescription] = useState<string>('');
  const [localEstHours, setLocalEstHours] = useState<string>('');
  const [localActHours, setLocalActHours] = useState<string>('');
  const [localDueDate, setLocalDueDate] = useState<string>('');

  useEffect(() => {
    if (task) {
      setLocalTitle(task.title || '');
      setLocalDescription(task.description || '');
      setLocalEstHours(task.estimatedHours != null ? String(task.estimatedHours) : '');
      setLocalActHours(task.actualHours != null ? String(task.actualHours) : '');
      setLocalDueDate(task.dueDate || '');
    }
  }, [task]);

  const handleFieldSave = async (fieldName: string, value: any) => {
    if (!task) return;

    // Build payload using task values as defaults
    const payload = {
      title: task.title,
      description: task.description || null,
      taskType: task.taskType,
      priority: task.priority,
      status: task.status,
      assignedEmployeeId: task.assignedEmployeeId || null,
      dueDate: task.dueDate || null,
      estimatedHours: task.estimatedHours != null ? task.estimatedHours : null,
      actualHours: task.actualHours != null ? task.actualHours : null,
      sortOrder: task.sortOrder
    };

    // Apply updated field
    if (fieldName === 'title') {
      const trimmed = String(value).trim();
      if (!trimmed) {
        setLocalTitle(task.title); // revert
        setErrorMessage('Title is required.');
        return;
      }
      payload.title = trimmed;
    } else if (fieldName === 'description') {
      payload.description = String(value).trim() || null;
    } else if (fieldName === 'taskType') {
      payload.taskType = value;
    } else if (fieldName === 'priority') {
      payload.priority = value;
    } else if (fieldName === 'status') {
      payload.status = value;
    } else if (fieldName === 'assignedEmployeeId') {
      payload.assignedEmployeeId = value || null;
    } else if (fieldName === 'dueDate') {
      payload.dueDate = value || null;
    } else if (fieldName === 'estimatedHours') {
      payload.estimatedHours = value !== '' ? Number(value) : null;
    } else if (fieldName === 'actualHours') {
      payload.actualHours = value !== '' ? Number(value) : null;
    }

    // Check if the value actually changed to avoid redundant API calls
    const isDifferent = (() => {
      if (fieldName === 'title') return payload.title !== task.title;
      if (fieldName === 'description') return payload.description !== task.description;
      if (fieldName === 'taskType') return payload.taskType !== task.taskType;
      if (fieldName === 'priority') return payload.priority !== task.priority;
      if (fieldName === 'status') return payload.status !== task.status;
      if (fieldName === 'assignedEmployeeId') return payload.assignedEmployeeId !== task.assignedEmployeeId;
      if (fieldName === 'dueDate') return payload.dueDate !== task.dueDate;
      if (fieldName === 'estimatedHours') return payload.estimatedHours !== task.estimatedHours;
      if (fieldName === 'actualHours') return payload.actualHours !== task.actualHours;
      return false;
    })();

    if (!isDifferent) return;

    setSavingField(fieldName);
    setErrorMessage(null);
    try {
      await postproductionApi.updateTask(task.id, payload);
      onTaskUpdated?.();
    } catch (err: any) {
      console.error(`Failed to update field ${fieldName}:`, err);
      setErrorMessage(err?.message || `Failed to update ${fieldName}.`);
      
      // Revert local field state
      if (fieldName === 'title') setLocalTitle(task.title);
      if (fieldName === 'description') setLocalDescription(task.description || '');
      if (fieldName === 'dueDate') setLocalDueDate(task.dueDate || '');
      if (fieldName === 'estimatedHours') setLocalEstHours(task.estimatedHours != null ? String(task.estimatedHours) : '');
      if (fieldName === 'actualHours') setLocalActHours(task.actualHours != null ? String(task.actualHours) : '');
    } finally {
      setSavingField(null);
    }
  };

  if (!isOpen || !task) return null;

  // Name mapping helpers
  const projectTitle = (() => {
    const proj = projects.find((p) => p.id === task.projectId);
    return proj ? proj.title : `Project (${task.projectId.substring(0, 8)})`;
  })();

  const deliverableName = (() => {
    const deliv = deliverables.find((d) => d.id === task.deliverableId);
    return deliv ? deliv.name : `Deliverable (${task.deliverableId.substring(0, 8)})`;
  })();



  const handleMoveStatus = async (status: PostProductionTaskStatus) => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await postproductionApi.moveTaskStatus(task.id, status);
      onStatusUpdated(task.id, status);
    } catch (err: any) {
      console.error('Failed to move task status:', err);
      setErrorMessage(err?.message || 'Failed to update task status. Please check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const nextStatus = getNextStatus(task.status);
  const isTerminal = task.status === 'DONE';

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300 animate-fadeIn"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-lg bg-[#0a0f1d] border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-slideInRight">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex-1 mr-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono flex items-center gap-2">
              <span>Post-Production Task</span>
              {savingField && (
                <span className="text-[9px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded animate-pulse">
                  Saving...
                </span>
              )}
            </span>
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={() => handleFieldSave('title', localTitle)}
              className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-violet-500 focus:bg-slate-950/20 text-base font-bold text-white w-full outline-none transition-all py-0.5 px-1 rounded-sm mt-0.5 focus:shadow-inner"
              placeholder="Task Title"
              maxLength={200}
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-2 text-rose-300 text-xs font-mono">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-[10px] text-slate-550 hover:text-slate-350 uppercase tracking-wider font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-900/20 border border-slate-850 p-4 rounded-xl">
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Task Type</span>
              <select
                value={task.taskType}
                onChange={(e) => handleFieldSave('taskType', e.target.value)}
                className="bg-slate-900/60 border border-slate-850 hover:border-slate-750 focus:border-violet-500/80 rounded-lg py-1 px-2 text-xs text-slate-200 font-semibold outline-none w-full transition-colors cursor-pointer"
              >
                {(['PHOTO_CULLING', 'PHOTO_EDITING', 'VIDEO_EDITING', 'COLOR_GRADING', 'AUDIO_SYNC', 'ALBUM_DESIGN', 'QUALITY_CHECK', 'EXPORT_UPLOAD', 'CLIENT_REVISION', 'OTHER'] as PostProductionTaskType[]).map((t) => (
                  <option key={t} value={t} className="bg-[#0a0f1d]">{getTaskTypeLabel(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Priority</span>
              <select
                value={task.priority}
                onChange={(e) => handleFieldSave('priority', e.target.value)}
                className={`bg-slate-900/60 border focus:border-violet-500/80 rounded-lg py-1 px-2 text-xs font-semibold outline-none w-full transition-colors cursor-pointer ${
                  task.priority === 'URGENT'
                    ? 'border-rose-500/35 text-rose-400 bg-rose-950/10'
                    : task.priority === 'HIGH'
                    ? 'border-orange-500/35 text-orange-400 bg-orange-950/10'
                    : task.priority === 'MEDIUM'
                    ? 'border-amber-500/35 text-amber-400 bg-amber-950/10'
                    : 'border-blue-500/35 text-blue-450 bg-blue-950/10'
                }`}
              >
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as PostProductionTaskPriority[]).map((p) => (
                  <option key={p} value={p} className="bg-[#0a0f1d] text-slate-200">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Current Status</span>
              <select
                value={task.status}
                onChange={(e) => handleFieldSave('status', e.target.value)}
                className="bg-slate-900/60 border border-slate-850 hover:border-slate-750 focus:border-violet-500/80 rounded-lg py-1 px-2 text-xs text-slate-200 font-semibold outline-none w-full transition-colors cursor-pointer"
              >
                {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'CHANGES_REQUESTED', 'DONE', 'BLOCKED'] as PostProductionTaskStatus[]).map((s) => (
                  <option key={s} value={s} className="bg-[#0a0f1d]">{getStatusLabel(s)}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Due Date</span>
              <input
                type="date"
                value={localDueDate}
                onChange={(e) => setLocalDueDate(e.target.value)}
                onBlur={() => handleFieldSave('dueDate', localDueDate)}
                className="bg-slate-900/60 border border-slate-850 hover:border-slate-750 focus:border-violet-500/80 rounded-lg py-1 px-2 text-xs text-slate-200 outline-none w-full transition-colors font-mono font-semibold"
              />
            </div>
          </div>

          {/* Project & Deliverable linkages */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">References & Assignee</span>
            <div className="space-y-3 bg-slate-900/20 border border-slate-850 p-4 rounded-xl text-xs">
              <div className="flex items-start gap-2.5">
                <Briefcase className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Linked Project</span>
                  <span className="text-slate-300 font-semibold block truncate mt-0.5">{projectTitle}</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block select-all">{task.projectId}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 border-t border-slate-850 pt-3">
                <Layers className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Linked Deliverable</span>
                  <span className="text-slate-300 font-semibold block truncate mt-0.5">{deliverableName}</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block select-all">{task.deliverableId}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 border-t border-slate-850 pt-3">
                <User className="h-4 w-4 text-slate-500 mt-1.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Assigned Editor *</span>
                  <select
                    value={task.assignedEmployeeId || ''}
                    onChange={(e) => handleFieldSave('assignedEmployeeId', e.target.value)}
                    className="bg-slate-900/60 border border-slate-850 hover:border-slate-750 focus:border-violet-500/80 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 outline-none w-full transition-colors cursor-pointer font-semibold"
                  >
                    <option value="" className="bg-[#0a0f1d]">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-[#0a0f1d]">{emp.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Tracking */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Hours Estimations</span>
            <div className="grid grid-cols-2 gap-4 bg-slate-900/20 border border-slate-850 p-4 rounded-xl text-xs">
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Estimated Hours</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Not specified"
                  value={localEstHours}
                  onChange={(e) => setLocalEstHours(e.target.value)}
                  onBlur={() => handleFieldSave('estimatedHours', localEstHours)}
                  className="bg-slate-900/60 border border-slate-850 hover:border-slate-750 focus:border-violet-500/80 rounded-lg py-1 px-2.5 text-xs text-slate-200 outline-none w-full transition-colors font-mono font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Actual Logged Hours</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={localActHours}
                  onChange={(e) => setLocalActHours(e.target.value)}
                  onBlur={() => handleFieldSave('actualHours', localActHours)}
                  className="bg-slate-900/60 border border-slate-850 hover:border-slate-750 focus:border-violet-500/80 rounded-lg py-1 px-2.5 text-xs text-slate-200 outline-none w-full transition-colors font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Description</span>
            <textarea
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              onBlur={() => handleFieldSave('description', localDescription)}
              placeholder="Add a detailed description for this task..."
              rows={3}
              className="bg-[#0f172a]/40 border border-slate-850/60 hover:border-slate-750 focus:border-violet-500/80 p-3 rounded-xl text-xs text-slate-350 leading-relaxed font-sans outline-none w-full transition-colors resize-y"
            />
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Checklist Subtasks</span>
            <SubtaskChecklist
              taskId={task.id}
              employees={employees}
              onSubtasksUpdated={onSubtasksUpdated}
            />
          </div>

          {/* Status Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-850">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Status Movement Actions</span>
            
            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={isSaving || isTerminal || !nextStatus || task.status === 'BLOCKED'}
                onClick={() => nextStatus && handleMoveStatus(nextStatus)}
                className="py-2.5 px-3 bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/20 disabled:opacity-40 disabled:hover:bg-violet-600/15 text-violet-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                title={nextStatus ? `Progress to ${getStatusLabel(nextStatus)}` : undefined}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                <span>{nextStatus ? getStatusLabel(nextStatus) : 'Next Stage'}</span>
              </button>
              
              <button
                disabled={isSaving || task.status === 'DONE'}
                onClick={() => handleMoveStatus('DONE')}
                className="py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 disabled:opacity-40 text-emerald-450 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Mark Done</span>
              </button>

              {task.status === 'BLOCKED' ? (
                <button
                  disabled={isSaving}
                  onClick={() => handleMoveStatus('TODO')}
                  className="py-2.5 px-3 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 disabled:opacity-40 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
                  <span>Unblock</span>
                </button>
              ) : (
                <button
                  disabled={isSaving}
                  onClick={() => handleMoveStatus('BLOCKED')}
                  className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-40 text-rose-450 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertOctagon className="h-4 w-4" />}
                  <span>Block Task</span>
                </button>
              )}
            </div>

            {/* Direct selector */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-slate-500 block">Move Directly To</span>
              <div className="flex flex-wrap gap-1.5">
                {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'CHANGES_REQUESTED', 'DONE', 'BLOCKED'] as PostProductionTaskStatus[]).map((st) => {
                  const isActive = task.status === st;
                  return (
                    <button
                      key={st}
                      disabled={isSaving}
                      onClick={() => handleMoveStatus(st)}
                      className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
                        isActive
                          ? 'bg-slate-800 text-white border-slate-650 cursor-default font-bold'
                          : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {getStatusLabel(st)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-lg text-xs font-semibold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </>
  );
};
