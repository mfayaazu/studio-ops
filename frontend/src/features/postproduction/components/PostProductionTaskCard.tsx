import React, { useState, useEffect } from 'react';
import type { PostProductionTask, PostProductionSubtask, PostProductionTaskStatus } from '../types';
import { postproductionApi } from '../api/postproductionApi';
import type { Employee } from '../../employees/types';
import { getPriorityColorClass, getTaskTypeLabel, getStatusLabel } from './PostProductionTaskDrawer';
import { Clock, User, Calendar, CheckSquare, Package, Loader2 } from 'lucide-react';
import { formatHoursRatio } from '../../../lib/formatters';

interface PostProductionTaskCardProps {
  task: PostProductionTask;
  employees: Employee[];
  projectName?: string;
  deliverableName?: string;
  onClick?: () => void;
  refreshTrigger?: number;
  onDragStart?: (taskId: string) => void;
  onDragEnd?: () => void;
  onTaskUpdated?: () => void;
  isCompact?: boolean;
}

export const PostProductionTaskCard: React.FC<PostProductionTaskCardProps> = ({
  task,
  employees,
  projectName,
  deliverableName,
  onClick,
  refreshTrigger = 0,
  onDragStart,
  onDragEnd,
  onTaskUpdated,
  isCompact = false
}) => {
  const [subtasks, setSubtasks] = useState<PostProductionSubtask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [localEmployeeId, setLocalEmployeeId] = useState<string>(task.assignedEmployeeId || '');

  useEffect(() => {
    setLocalEmployeeId(task.assignedEmployeeId || '');
  }, [task.assignedEmployeeId]);

  useEffect(() => {
    let active = true;
    const loadSubtasks = async () => {
      try {
        const data = await postproductionApi.fetchSubtasks(task.id);
        if (active) {
          setSubtasks(data);
        }
      } catch (err) {
        console.warn(`Failed to fetch subtasks for task ${task.id}:`, err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadSubtasks();
    return () => {
      active = false;
    };
  }, [task.id, refreshTrigger, task.status]);

  const handleAssigneeChange = async (newEmployeeId: string) => {
    setIsUpdating(true);
    const originalEmployeeId = localEmployeeId;
    setLocalEmployeeId(newEmployeeId);

    const payload = {
      title: task.title,
      description: task.description || null,
      taskType: task.taskType,
      priority: task.priority,
      status: task.status,
      assignedEmployeeId: newEmployeeId || null,
      dueDate: task.dueDate || null,
      estimatedHours: task.estimatedHours != null ? task.estimatedHours : null,
      actualHours: task.actualHours != null ? task.actualHours : null,
      sortOrder: task.sortOrder
    };

    try {
      await postproductionApi.updateTask(task.id, payload);
      onTaskUpdated?.();
    } catch (err: any) {
      console.error('Failed to update assignee:', err);
      alert(err?.message || 'Failed to update assignee. Reverting.');
      setLocalEmployeeId(originalEmployeeId);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: PostProductionTaskStatus) => {
    setIsUpdating(true);

    const payload = {
      title: task.title,
      description: task.description || null,
      taskType: task.taskType,
      priority: task.priority,
      status: newStatus,
      assignedEmployeeId: task.assignedEmployeeId || null,
      dueDate: task.dueDate || null,
      estimatedHours: task.estimatedHours != null ? task.estimatedHours : null,
      actualHours: task.actualHours != null ? task.actualHours : null,
      sortOrder: task.sortOrder
    };

    try {
      await postproductionApi.updateTask(task.id, payload);
      onTaskUpdated?.();
    } catch (err: any) {
      console.error('Failed to update task status:', err);
      alert(err?.message || 'Failed to update stage. Reverting.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Subtask progress calculations
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.status === 'DONE').length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Format due date helper
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  const resolvedDeliverableName =
    deliverableName || `Deliverable (${task.deliverableId.substring(0, 8)})`;

  if (isCompact) {
    return (
      <div
        onClick={onClick}
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', task.id);
          onDragStart?.(task.id);
        }}
        onDragEnd={onDragEnd}
        className="bg-[#0f172a]/95 hover:bg-[#131c35] border border-slate-855 hover:border-slate-700/80 rounded-lg p-2 transition-all duration-200 shadow-sm group cursor-grab active:cursor-grabbing select-none space-y-1"
      >
        <div className="flex items-center justify-between gap-1">
          <h4 className="font-bold text-slate-200 text-[10px] group-hover:text-violet-400 transition-colors truncate">
            {task.title}
          </h4>
          <span className={`px-1 py-[1px] rounded text-[8px] font-bold uppercase shrink-0 ${getPriorityColorClass(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        <div className="flex items-center justify-between text-[8px] text-slate-450 gap-1">
          <span className="text-slate-500 font-semibold truncate">
            {getTaskTypeLabel(task.taskType)}
          </span>
          <span className={`${isOverdue ? 'text-rose-455 font-bold' : 'text-slate-500'} font-mono`}>
            {task.dueDate || 'No due'}
          </span>
        </div>

        <div 
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col border-t border-slate-800/30 pt-1.5 mt-1 gap-1 text-[8px]"
        >
          <div className="flex items-center justify-between gap-1 w-full">
            <div className="relative inline-block w-20">
              <select
                value={localEmployeeId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                disabled={isUpdating}
                className="bg-transparent hover:bg-slate-900 border-none rounded py-0.2 px-1 text-[8px] text-slate-400 font-semibold outline-none cursor-pointer w-full truncate"
              >
                <option value="" className="bg-slate-950">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-slate-900">{emp.fullName}</option>
                ))}
              </select>
            </div>
            
            {!loading && totalSubtasks > 0 && (
              <span className="text-slate-550 font-mono shrink-0">
                ✓ {completedSubtasks}/{totalSubtasks}
              </span>
            )}
          </div>

          <div className="relative inline-block w-full">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as PostProductionTaskStatus)}
              disabled={isUpdating}
              className="bg-transparent hover:bg-slate-900 border-none rounded py-0.2 px-1 text-[8px] text-slate-450 font-bold outline-none cursor-pointer w-full truncate"
            >
              {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'CHANGES_REQUESTED', 'DONE', 'BLOCKED'] as PostProductionTaskStatus[]).map(s => (
                <option key={s} value={s} className="bg-slate-900">Stage: {getStatusLabel(s)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        onDragStart?.(task.id);
      }}
      onDragEnd={onDragEnd}
      className="bg-[#0f172a]/95 hover:bg-[#131c35] border border-slate-850 hover:border-slate-700/80 rounded-lg p-2.5 transition-all duration-200 shadow-md group cursor-grab active:cursor-grabbing select-none space-y-2.5"
    >
      {/* Context info: Project & Deliverable */}
      <div className="space-y-0.5">
        {projectName && (
          <div className="flex items-center gap-1 text-[8px] text-slate-500 font-bold uppercase tracking-wider">
            <Package className="h-2.5 w-2.5 text-slate-600 flex-shrink-0" />
            <span className="truncate">{projectName}</span>
          </div>
        )}
        <div className="text-[9px] text-slate-400 font-semibold truncate pl-3.5">
          {resolvedDeliverableName}
        </div>
      </div>

      {/* Title & Priority Badge */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0 flex-grow">
          <h4 className="font-bold text-slate-200 text-xs group-hover:text-violet-400 transition-colors line-clamp-2 leading-tight">
            {task.title}
          </h4>
          <span className="text-[9px] text-slate-500 font-semibold mt-0.5 inline-block">
            {getTaskTypeLabel(task.taskType)}
          </span>
        </div>
        <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold tracking-wide uppercase flex-shrink-0 ${getPriorityColorClass(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {/* Due Date & Estimate/Actual Hours */}
      <div className="flex items-center justify-between text-[10px] text-slate-450 border-t border-slate-800/40 pt-2">
        <div className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-rose-450 font-bold' : 'text-slate-400'}`}>
          <Calendar className="h-3 w-3 text-slate-500" />
          <span>{task.dueDate || 'No due date'}</span>
        </div>
        
        {(task.estimatedHours != null || task.actualHours != null) && (
          <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400 font-semibold bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-850">
            <Clock className="h-2.5 w-2.5 text-slate-500" />
            <span>
              {formatHoursRatio(task.actualHours, task.estimatedHours)}
            </span>
          </div>
        )}
      </div>

      {/* Subtasks Progress Bar */}
      {!loading && totalSubtasks > 0 && (
        <div className="space-y-1 border-t border-slate-800/40 pt-1.5">
          <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold font-mono">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-2.5 w-2.5" />
              <span>Subtasks</span>
            </span>
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Assignee & Status Footer with Card-Level Dropdowns */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="grid grid-cols-2 gap-2 border-t border-slate-800/40 pt-2.5 text-[9px] text-slate-400 font-semibold relative"
      >
        <div className="flex items-center gap-1 min-w-0">
          <User className="h-3 w-3 text-slate-500 flex-shrink-0" />
          <select
            draggable="false"
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            value={localEmployeeId}
            onChange={(e) => handleAssigneeChange(e.target.value)}
            disabled={isUpdating}
            className="bg-[#0f172a]/60 border border-slate-850 hover:border-slate-700/80 focus:border-violet-500/80 rounded px-1 py-0.5 text-[9px] text-slate-300 font-semibold outline-none transition-colors cursor-pointer w-full disabled:opacity-50 truncate"
          >
            <option value="">Unassigned</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.fullName}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider shrink-0">Stage</span>
          <select
            draggable="false"
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as PostProductionTaskStatus)}
            disabled={isUpdating}
            className="bg-[#0f172a]/60 border border-slate-850 hover:border-slate-700/80 focus:border-violet-500/80 rounded px-1 py-0.5 text-[9px] text-slate-300 font-semibold outline-none transition-colors cursor-pointer w-full disabled:opacity-50 truncate"
          >
            {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'CHANGES_REQUESTED', 'DONE', 'BLOCKED'] as PostProductionTaskStatus[]).map(s => (
              <option key={s} value={s}>{getStatusLabel(s)}</option>
            ))}
          </select>
        </div>

        {isUpdating && (
          <div className="absolute right-0 -top-3 flex items-center gap-1 text-[8px] text-violet-400 font-bold font-mono animate-pulse bg-[#0f172a] px-1 rounded border border-slate-800">
            <Loader2 className="h-2 w-2 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>
    </div>
  );
};
