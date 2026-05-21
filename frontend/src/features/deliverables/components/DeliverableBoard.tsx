import React from 'react';
import { Edit2, Trash2, Calendar, Link, AlertCircle } from 'lucide-react';
import type { Deliverable, DeliverableStatus } from '../types';
import type { Project } from '../../projects/types';

interface DeliverableBoardProps {
  deliverables: Deliverable[];
  projects: Project[];
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

export const DeliverableBoard: React.FC<DeliverableBoardProps> = ({
  deliverables,
  projects,
  onEdit,
  onDelete,
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
      ? { code: project.projectCode, title: project.title }
      : { code: 'N/A', title: 'Unknown Project' };
  };

  const isOverdue = (item: Deliverable) => {
    if (!item.dueDate) return false;
    const isPast = item.dueDate < todayStr;
    const isDone = item.status === 'DELIVERED' || item.status === 'COMPLETED';
    return isPast && !isDone;
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete deliverable "${name}"?`)) {
      onDelete(id);
    }
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

                  return (
                    <div
                      key={item.id}
                      className={`bg-slate-900/80 border rounded-xl p-3.5 shadow-md transition-all hover:border-slate-700 hover:bg-slate-900 hover:-translate-y-0.5 duration-200 group relative ${
                        overdue ? 'border-rose-500/30' : 'border-slate-800'
                      }`}
                    >
                      {/* Project Header */}
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-[10px] font-mono text-indigo-400 font-bold shrink-0">
                          {project.code}
                        </span>
                        {item.referenceUrl && (
                          <a
                            href={item.referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-white transition-colors shrink-0"
                            title="Open Reference URL"
                          >
                            <Link className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {/* Name & Type */}
                      <h4 className="text-white font-medium text-xs line-clamp-2 leading-relaxed mb-2">
                        {item.name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                        <span className="bg-slate-800 text-slate-300 text-[9px] font-semibold px-2 py-0.5 rounded">
                          {formatDeliverableType(item.deliverableType)}
                        </span>

                        {overdue && (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span>Overdue</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom row: Due Date and Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
                        <div className="flex items-center space-x-1 text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-mono">
                            {item.dueDate ? item.dueDate : 'No Date'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
                            title="Edit deliverable"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete deliverable"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
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
