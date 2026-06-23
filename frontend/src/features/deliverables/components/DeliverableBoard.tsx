import React from 'react';
import { Calendar, Link, AlertCircle, User } from 'lucide-react';
import type { Deliverable, DeliverableStatus } from '../types';
import type { Project } from '../../projects/types';
import type { Employee } from '../../employees/types';

interface DeliverableBoardProps {
  deliverables: Deliverable[];
  projects: Project[];
  employees: Employee[];
  onEdit: (deliverable: Deliverable) => void;
  onDelete: (id: string) => void;
}

const COLUMNS: { status: DeliverableStatus; label: string; headerColor: string }[] = [
  { status: 'NOT_STARTED', label: 'Not Started', headerColor: 'border-slate-800' },
  { status: 'IN_PROGRESS', label: 'In Progress', headerColor: 'border-amber-500/20' },
  { status: 'WAITING_FOR_CLIENT', label: 'Waiting on Client', headerColor: 'border-sky-500/20' },
  { status: 'READY_FOR_REVIEW', label: 'For Review', headerColor: 'border-fuchsia-500/20' },
  { status: 'REVISION_REQUIRED', label: 'Revision Required', headerColor: 'border-orange-500/20' },
  { status: 'DELIVERED', label: 'Delivered', headerColor: 'border-emerald-500/20' },
  { status: 'COMPLETED', label: 'Completed', headerColor: 'border-indigo-500/20' },
];

const formatDeliverableType = (type: string) => {
  return type
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const getPriorityColorClass = (priority: string): string => {
  switch (priority) {
    case 'LOW': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'URGENT': return 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold';
    default: return 'bg-slate-800 text-slate-400 border-slate-700/50';
  }
};

export const DeliverableBoard: React.FC<DeliverableBoardProps> = ({
  deliverables,
  projects,
  employees,
  onEdit,
}) => {
  const todayStr = (() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const getProjectDetails = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project
      ? { code: project.projectCode, title: project.title || (project as any).name || 'Untitled Project' }
      : { code: `ID: ${projectId.substring(0, 8)}`, title: 'Unknown Project' };
  };

  const isOverdue = (item: Deliverable) => {
    if (!item.dueDate) return false;
    const isPast = item.dueDate < todayStr;
    const isDone = item.status === 'DELIVERED' || item.status === 'COMPLETED';
    return isPast && !isDone;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
      {COLUMNS.map(col => {
        const columnDeliverables = deliverables.filter(d => d.status === col.status);

        return (
          <div
            key={col.status}
            className="w-80 shrink-0 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col min-h-[600px] max-h-[750px]"
          >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/60">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    col.status === 'COMPLETED'
                      ? 'bg-indigo-400'
                      : col.status === 'DELIVERED'
                      ? 'bg-emerald-400'
                      : col.status === 'READY_FOR_REVIEW'
                      ? 'bg-fuchsia-400'
                      : col.status === 'WAITING_FOR_CLIENT'
                      ? 'bg-sky-400'
                      : col.status === 'IN_PROGRESS'
                      ? 'bg-amber-400'
                      : col.status === 'REVISION_REQUIRED'
                      ? 'bg-orange-400'
                      : 'bg-slate-500'
                  }`}
                />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {col.label}
                </h3>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 font-mono font-bold px-2 py-0.5 rounded-full">
                {columnDeliverables.length}
              </span>
            </div>

            {/* Cards Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
              {columnDeliverables.length === 0 ? (
                <div className="h-24 flex items-center justify-center border border-dashed border-slate-850 rounded-xl text-slate-600 text-xs">
                  No deliverables
                </div>
              ) : (
                columnDeliverables.map(item => {
                  const project = getProjectDetails(item.projectId);
                  const overdue = isOverdue(item);
                  const priority = (item as any).priority;
                  const empId = (item as any).assignedEmployeeId;
                  const employee = empId ? employees.find(e => e.id === empId) : null;
                  const editorName = employee
                    ? employee.fullName
                    : (empId ? `Editor (${empId.substring(0, 8)})` : null);

                  return (
                    <div
                      key={item.id}
                      onClick={() => onEdit(item)}
                      className={`bg-slate-900/80 border rounded-xl p-3.5 shadow-md transition-all hover:border-slate-700 hover:bg-slate-900/95 hover:-translate-y-0.5 duration-200 group relative cursor-pointer select-none space-y-2.5 ${
                        overdue ? 'border-rose-500/30' : 'border-slate-800'
                      }`}
                    >
                      {/* Project context top line */}
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold truncate flex-grow">
                          {project.title}
                        </span>
                        {item.referenceUrl && (
                          <a
                            href={item.referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-500 hover:text-white transition-colors shrink-0"
                            title="Open Reference URL"
                          >
                            <Link className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {/* Main Title */}
                      <h4 className="text-white font-bold text-xs leading-normal line-clamp-2">
                        {item.name}
                      </h4>

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {project.code && (
                          <span className="bg-slate-900 text-indigo-400 border border-slate-850 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                            {project.code}
                          </span>
                        )}
                        <span className="bg-slate-800/80 text-slate-300 text-[9px] font-semibold px-2 py-0.5 rounded border border-slate-800/50">
                          {item.deliverableType === 'OTHER' && item.customDeliverableType ? item.customDeliverableType : formatDeliverableType(item.deliverableType)}
                        </span>
                        {priority && (
                          <span className={`px-1.5 py-0.5 rounded-full border text-[8px] font-extrabold tracking-wide uppercase flex-shrink-0 ${getPriorityColorClass(priority)}`}>
                            {priority}
                          </span>
                        )}
                        {overdue && (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span>Overdue</span>
                          </span>
                        )}
                      </div>

                      {/* Editor & Due date footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 mt-1 text-[10px] text-slate-450 font-semibold">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-mono">
                            {item.dueDate ? item.dueDate : 'No Date'}
                          </span>
                        </div>

                        {editorName && (
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 truncate max-w-[120px]">
                            <User className="h-3 w-3 text-slate-500" />
                            <span className="truncate">{editorName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
