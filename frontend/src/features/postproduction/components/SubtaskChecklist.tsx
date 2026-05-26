import React, { useState, useEffect } from 'react';
import type { PostProductionSubtask, PostProductionSubtaskStatus } from '../types';
import { postproductionApi } from '../api/postproductionApi';
import type { Employee } from '../../employees/types';
import { Loader2, CheckSquare, Square, User } from 'lucide-react';

interface SubtaskChecklistProps {
  taskId: string;
  employees: Employee[];
  onSubtasksUpdated?: () => void;
}

export const SubtaskChecklist: React.FC<SubtaskChecklistProps> = ({
  taskId,
  employees,
  onSubtasksUpdated
}) => {
  const [subtasks, setSubtasks] = useState<PostProductionSubtask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Map employee IDs to names for easy lookup
  const employeeMap = React.useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((emp) => {
      map.set(emp.id, emp.fullName);
    });
    return map;
  }, [employees]);

  const loadSubtasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postproductionApi.fetchSubtasks(taskId);
      // Sort by sortOrder
      const sorted = [...data].sort((a, b) => a.sortOrder - b.sortOrder);
      setSubtasks(sorted);
    } catch (err) {
      console.error('Failed to load subtasks:', err);
      setError('Could not load subtasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubtasks();
  }, [taskId]);

  const handleToggle = async (subtask: PostProductionSubtask) => {
    if (togglingId) return; // Prevent multiple requests

    const newStatus: PostProductionSubtaskStatus = subtask.status === 'DONE' ? 'TODO' : 'DONE';
    setTogglingId(subtask.id);
    try {
      const updated = await postproductionApi.moveSubtaskStatus(subtask.id, newStatus);
      setSubtasks((prev) =>
        prev.map((sub) => (sub.id === subtask.id ? updated : sub))
      );
      if (onSubtasksUpdated) {
        onSubtasksUpdated();
      }
    } catch (err) {
      console.error('Failed to update subtask status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 justify-center text-xs text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
        <span>Loading checklist...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-3 px-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs">
        {error}
      </div>
    );
  }

  if (subtasks.length === 0) {
    return (
      <div className="py-4 text-center border border-dashed border-slate-800 rounded-xl">
        <p className="text-xs text-slate-500">No subtasks assigned to this task.</p>
      </div>
    );
  }

  const completedCount = subtasks.filter((s) => s.status === 'DONE').length;
  const progressPercent = Math.round((completedCount / subtasks.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>Subtasks Progress</span>
          <span className="font-mono">{completedCount}/{subtasks.length} ({progressPercent}%)</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {subtasks.map((sub) => {
          const isDone = sub.status === 'DONE';
          const isToggling = togglingId === sub.id;
          const assigneeName = sub.assignedEmployeeId
            ? employeeMap.get(sub.assignedEmployeeId) || sub.assignedEmployeeId.substring(0, 8)
            : null;

          return (
            <div
              key={sub.id}
              onClick={() => !isToggling && handleToggle(sub)}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                isDone
                  ? 'bg-slate-900/20 border-slate-850/50 text-slate-500'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-200 hover:bg-slate-800/30 hover:border-slate-700/60'
              } ${isToggling ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <button
                className={`mt-0.5 flex-shrink-0 transition-colors ${
                  isDone ? 'text-violet-500' : 'text-slate-500 hover:text-slate-400'
                }`}
                disabled={isToggling}
              >
                {isDone ? (
                  <CheckSquare className="h-4.5 w-4.5" />
                ) : (
                  <Square className="h-4.5 w-4.5" />
                )}
              </button>
              
              <div className="flex-1 min-w-0 space-y-1">
                <span
                  className={`text-xs font-semibold leading-relaxed break-words block ${
                    isDone ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}
                >
                  {sub.title}
                </span>
                
                {sub.description && (
                  <p className="text-[10px] text-slate-500 leading-normal font-medium">
                    {sub.description}
                  </p>
                )}

                {assigneeName && (
                  <div className="flex items-center gap-1 text-[9px] text-slate-500 font-semibold font-mono">
                    <User className="h-2.5 w-2.5" />
                    <span>{assigneeName}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
