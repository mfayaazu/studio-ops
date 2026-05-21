import React from 'react';
import { Edit2, Trash2, Calendar, Link, AlertCircle } from 'lucide-react';
import type { Deliverable } from '../types';
import type { Project } from '../../projects/types';

interface DeliverableListProps {
  deliverables: Deliverable[];
  projects: Project[];
  onEdit: (deliverable: Deliverable) => void;
  onDelete: (id: string) => void;
}

const formatDeliverableType = (type: string) => {
  return type
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'DELIVERED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'READY_FOR_REVIEW':
      return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20';
    case 'WAITING_FOR_CLIENT':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'IN_PROGRESS':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'REVISION_REQUIRED':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};

export const DeliverableList: React.FC<DeliverableListProps> = ({
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/40">
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Deliverable Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Reference URL</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {deliverables.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-500 text-sm">
                  No deliverables found matching your filters.
                </td>
              </tr>
            ) : (
              deliverables.map(item => {
                const project = getProjectDetails(item.projectId);
                const overdue = isOverdue(item);

                return (
                  <tr key={item.id} className="hover:bg-slate-800/25 transition-colors group">
                    {/* Project */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-indigo-400 font-semibold text-[11px] mb-0.5">
                          {project.code}
                        </span>
                        <span className="text-white font-medium max-w-[150px] truncate" title={project.title}>
                          {project.title}
                        </span>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4 text-slate-200 font-medium max-w-[200px] truncate" title={item.name}>
                      {item.name}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700">
                        {formatDeliverableType(item.deliverableType)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(item.status)}`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4">
                      {item.dueDate ? (
                        <div className={`flex items-center space-x-1.5 ${overdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.dueDate}</span>
                          {overdue && <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />}
                        </div>
                      ) : (
                        <span className="text-slate-600">No Date</span>
                      )}
                    </td>

                    {/* Reference URL */}
                    <td className="px-6 py-4">
                      {item.referenceUrl ? (
                        <a
                          href={item.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 transition-colors font-mono max-w-[160px] truncate"
                          title={item.referenceUrl}
                        >
                          <Link className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                          <span>{item.referenceUrl}</span>
                        </a>
                      ) : (
                        <span className="text-slate-700 italic">None</span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                          title="Edit deliverable"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete deliverable"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
