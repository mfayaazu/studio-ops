import React, { useState, useEffect } from 'react';
import type { PostProductionTask, PostProductionSubtask } from '../types';
import { postproductionApi } from '../api/postproductionApi';
import type { Employee } from '../../employees/types';
import { getPriorityColorClass, getTaskTypeLabel } from './PostProductionTaskDrawer';
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
  onTaskUpdated
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

  // Subtask progress calculations
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.status === 'DONE').length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Format due date helper
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  const resolvedDeliverableName =
    deliverableName || `Deliverable (${task.deliverableId.substring(0, 8)})`;

  return (
    <div
      onClick={onClick}
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        onDragStart?.(task.id);
      }}
      onDragEnd={onDragEnd}
      className="bg-[#0f172a]/95 hover:bg-[#131c35] border border-slate-850 hover:border-slate-700/80 rounded-xl p-3.5 transition-all duration-200 shadow-md hover:shadow-lg group space-y-3 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Context info: Project & Deliverable */}
      <div className="space-y-0.5">
        {projectName && (
          <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            <Package className="h-2.5 w-2.5 text-slate-600 flex-shrink-0" />
            <span className="truncate">{projectName}</span>
          </div>
        )}
        <div className="text-[10px] text-slate-400 font-semibold truncate pl-3.5">
          {resolvedDeliverableName}
        </div>
      </div>

      {/* Title & Priority Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-bold text-slate-200 text-xs group-hover:text-violet-400 transition-colors line-clamp-2 leading-relaxed">
            {task.title}
          </h4>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">
            {getTaskTypeLabel(task.taskType)}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full border text-[8px] font-extrabold tracking-wide uppercase flex-shrink-0 ${getPriorityColorClass(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {/* Due Date & Estimate/Actual Hours */}
      <div className="flex items-center justify-between text-[11px] text-slate-450 border-t border-slate-800/40 pt-2.5">
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
        <div className="space-y-1.5 border-t border-slate-800/40 pt-2">
          <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold font-mono">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
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

      {/* Assignee Footer with Card-Level Dropdown */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="flex items-center gap-2 border-t border-slate-800/40 pt-2 text-[10px] text-slate-400 font-semibold"
      >
        <User className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
        <div className="relative inline-block w-full">
          <select
            draggable="false"
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            value={localEmployeeId}
            onChange={(e) => handleAssigneeChange(e.target.value)}
            disabled={isUpdating}
            className="bg-[#0f172a]/60 border border-slate-850 hover:border-slate-700/80 focus:border-violet-500/80 rounded px-1.5 py-0.5 text-[9px] text-slate-300 font-semibold outline-none transition-colors cursor-pointer w-full disabled:opacity-50"
          >
            <option value="">Unassigned</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.fullName}</option>
            ))}
          </select>
          {isUpdating && (
            <div className="absolute right-6 top-1 flex items-center gap-1 text-[8px] text-violet-400 font-bold font-mono animate-pulse">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
