import React, { useState } from 'react';
import type { PostProductionTask, PostProductionTaskStatus } from '../types';
import { PostProductionColumn } from './PostProductionColumn';
import type { Employee } from '../../employees/types';
import type { Project } from '../../projects/types';
import type { Deliverable } from '../../deliverables/types';

interface PostProductionKanbanBoardProps {
  tasks: PostProductionTask[];
  employees: Employee[];
  projects: Project[];
  deliverables: Deliverable[];
  onTaskClick?: (task: PostProductionTask) => void;
  refreshTrigger?: number;
  onDropTask?: (taskId: string, targetStatus: PostProductionTaskStatus) => void;
  onTaskUpdated?: () => void;
  isCompact?: boolean;
}

const BOARD_COLUMNS: PostProductionTaskStatus[] = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'CHANGES_REQUESTED',
  'DONE',
  'BLOCKED'
];

/**
 * Returns the best human-readable label for a project.
 * Priority: title → projectCode → short-UUID fallback.
 * Exported so other components can reuse it if needed.
 */
export const getProjectLabel = (project: Project): string => {
  if (project.title && project.title.trim()) return project.title.trim();
  if ((project as any).projectTitle && (project as any).projectTitle.trim()) return (project as any).projectTitle.trim();
  if ((project as any).name && (project as any).name.trim()) return (project as any).name.trim();
  if (project.projectCode && project.projectCode.trim()) return project.projectCode.trim();
  return `Project (${project.id.substring(0, 8)})`;
};

export const PostProductionKanbanBoard: React.FC<PostProductionKanbanBoardProps> = ({
  tasks,
  employees,
  projects,
  deliverables,
  onTaskClick,
  refreshTrigger = 0,
  onDropTask,
  onTaskUpdated,
  isCompact = false
}) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  return (
    <div className="bg-[#0b1222]/50 border border-slate-800/60 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Board Summary */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Post-Production Kanban Workflow
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tasks are grouped by project inside each status column — click any card to open the detail drawer
          </p>
        </div>
      </div>

      {/* Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-900/50">
        {BOARD_COLUMNS.map((status) => {
          const statusTasks = tasks.filter((t) => t.status === status);
          return (
            <PostProductionColumn
              key={status}
              status={status}
              tasks={statusTasks}
              employees={employees}
              projects={projects}
              deliverables={deliverables}
              onTaskClick={onTaskClick}
              refreshTrigger={refreshTrigger}
              draggingTaskId={draggingTaskId}
              onDragStart={(id) => setDraggingTaskId(id)}
              onDragEnd={() => setDraggingTaskId(null)}
              onDropTask={(id, targetStatus) => {
                setDraggingTaskId(null);
                onDropTask?.(id, targetStatus);
              }}
              onTaskUpdated={onTaskUpdated}
              isCompact={isCompact}
            />
          );
        })}
      </div>
    </div>
  );
};
