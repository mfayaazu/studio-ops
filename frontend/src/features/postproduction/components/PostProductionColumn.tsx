import React, { useState } from 'react';
import type { PostProductionTask, PostProductionTaskStatus } from '../types';
import { PostProductionTaskCard } from './PostProductionTaskCard';
import type { Employee } from '../../employees/types';
import type { Project } from '../../projects/types';
import type { Deliverable } from '../../deliverables/types';
import { getStatusLabel } from './PostProductionTaskDrawer';
import { FolderOpen } from 'lucide-react';
import { formatHours } from '../../../lib/formatters';

interface PostProductionColumnProps {
  status: PostProductionTaskStatus;
  tasks: PostProductionTask[];
  employees: Employee[];
  projects: Project[];
  deliverables: Deliverable[];
  onTaskClick?: (task: PostProductionTask) => void;
  refreshTrigger?: number;
  onDragStart?: (taskId: string) => void;
  onDragEnd?: () => void;
  onDropTask?: (taskId: string, targetStatus: PostProductionTaskStatus) => void;
  draggingTaskId?: string | null;
  onTaskUpdated?: () => void;
  isCompact?: boolean;
}

const getColumnHeaderColor = (status: PostProductionTaskStatus): string => {
  switch (status) {
    case 'BACKLOG':            return 'border-t-2 border-slate-500';
    case 'TODO':               return 'border-t-2 border-sky-400';
    case 'IN_PROGRESS':        return 'border-t-2 border-violet-500';
    case 'IN_REVIEW':          return 'border-t-2 border-amber-400';
    case 'CHANGES_REQUESTED':  return 'border-t-2 border-rose-500';
    case 'DONE':               return 'border-t-2 border-emerald-400';
    case 'BLOCKED':            return 'border-t-2 border-red-500';
    default:                   return '';
  }
};

export const PostProductionColumn: React.FC<PostProductionColumnProps> = ({
  status,
  tasks,
  employees,
  projects,
  deliverables,
  onTaskClick,
  refreshTrigger = 0,
  onDragStart,
  onDragEnd,
  onDropTask,
  draggingTaskId,
  onTaskUpdated,
  isCompact = false
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (taskId) {
      onDropTask?.(taskId, status);
    }
  };

  // Group tasks by projectId, preserving sort order within each group
  const groupedByProject: Record<string, PostProductionTask[]> = {};
  for (const task of tasks) {
    if (!groupedByProject[task.projectId]) {
      groupedByProject[task.projectId] = [];
    }
    groupedByProject[task.projectId].push(task);
  }

  // Stable group order: first occurrence order from the tasks array (already sorted by parent)
  const projectOrder = tasks
    .map((t) => t.projectId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col ${isCompact ? 'w-60 p-1.5 space-y-2' : 'w-64 p-2.5 space-y-3'} transition-all duration-200 border rounded-xl max-h-[76vh] flex-shrink-0 ${
        isDragOver
          ? 'bg-slate-900/90 border-dashed border-violet-500/50 shadow-inner scale-[1.01]'
          : 'bg-[#090f1e]/40 border-slate-800/80'
      } ${getColumnHeaderColor(status)}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/30">
        <div>
          <h3 className="font-bold text-slate-300 text-[10px] tracking-wider uppercase">
            {getStatusLabel(status)}
          </h3>
          <span className="text-[9px] text-slate-500 font-mono font-semibold block">
            {totalEstimatedHours > 0 ? `${formatHours(totalEstimatedHours)} Est` : '0h'}
          </span>
        </div>
        <span className="h-4 min-w-4 px-1 flex items-center justify-center rounded bg-slate-800 text-slate-400 text-[9px] font-bold font-mono">
          {tasks.length}
        </span>
      </div>

      {/* Cards Scroll Area */}
      <div className={`flex-1 overflow-y-auto ${isCompact ? 'space-y-2.5' : 'space-y-3'} pr-0.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent`}>
        {tasks.length === 0 ? (
          <div className="border border-dashed border-slate-800/30 rounded-lg py-6 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] text-slate-650 font-bold tracking-wider uppercase">
              Empty Stage
            </span>
          </div>
        ) : (
          projectOrder.map((projectId) => {
            const projectTasks = groupedByProject[projectId];
            const project = projects.find(p => p.id === projectId);
            const projectTitle = project ? (project.title || (project as any).name || 'Untitled Project') : 'Unknown Project';
            const projectCode = project ? project.projectCode : `ID: ${projectId.substring(0, 8)}`;
            
            const groupEstHours = projectTasks.reduce(
              (sum, t) => sum + (t.estimatedHours || 0),
              0
            );

            return (
              <div key={projectId} className="space-y-1.5">
                {/* Project Group Header */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/60 border border-slate-800/70 rounded-lg">
                  <FolderOpen className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                  <div className="flex flex-col min-w-0 flex-grow">
                    <span
                      className="text-[9px] font-bold text-slate-350 truncate leading-tight"
                      title={projectTitle}
                    >
                      {projectTitle}
                    </span>
                    {projectCode && (
                      <span className="text-[8px] font-mono font-bold text-indigo-400/80 tracking-wide">
                        {projectCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="px-1 py-0.2 bg-slate-800 text-slate-400 rounded text-[8px] font-bold font-mono">
                      {projectTasks.length}
                    </span>
                    {groupEstHours > 0 && (
                      <span className="text-[8px] text-slate-500 font-mono font-semibold">
                        {formatHours(groupEstHours)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cards for this project group */}
                <div className="space-y-1.5 pl-0.5">
                  {projectTasks.map((task) => {
                    const deliverable = deliverables.find(d => d.id === task.deliverableId);
                    const delivName = deliverable ? deliverable.name : `Deliverable (${task.deliverableId.substring(0, 8)})`;
                    
                    return (
                      <div
                        key={task.id}
                        className={draggingTaskId === task.id ? 'opacity-40' : ''}
                      >
                        <PostProductionTaskCard
                          task={task}
                          employees={employees}
                          projectName={projectTitle}
                          deliverableName={delivName}
                          onClick={() => onTaskClick && onTaskClick(task)}
                          refreshTrigger={refreshTrigger}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                          onTaskUpdated={onTaskUpdated}
                          isCompact={isCompact}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
