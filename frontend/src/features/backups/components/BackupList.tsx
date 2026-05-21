import React from 'react';
import { Edit2, Trash2, Calendar, FileText, Link } from 'lucide-react';
import type { BackupRecord } from '../types';
import type { Project } from '../../projects/types';

interface BackupListProps {
  backups: BackupRecord[];
  projects: Project[];
  onEdit: (backup: BackupRecord) => void;
  onDelete: (id: string) => void;
}

const formatBackupType = (type: string) => {
  return type
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const formatLocationType = (type: string) => {
  if (type === 'CLOUD_S3') return 'Cloud S3';
  if (type === 'LOCAL_NAS') return 'Local NAS';
  if (type === 'EXTERNAL_HARD_DRIVE') return 'External Drive';
  return type;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'PENDING':
    case 'IN_PROGRESS':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'FAILED':
    case 'NEEDS_ATTENTION':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};

export const BackupList: React.FC<BackupListProps> = ({ backups, projects, onEdit, onDelete }) => {
  const getProjectDetails = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project
      ? { code: project.projectCode, title: project.title }
      : { code: 'N/A', title: 'Unknown Project' };
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this backup record?')) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Type / Location</th>
              <th className="px-6 py-4">Destination Path</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Verified At</th>
              <th className="px-6 py-4">Notes</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {backups.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-500 text-sm">
                  No backup records found matching your filters.
                </td>
              </tr>
            ) : (
              backups.map(backup => {
                const project = getProjectDetails(backup.projectId);
                return (
                  <tr key={backup.id} className="hover:bg-slate-800/25 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-indigo-400 font-semibold text-[11px] mb-0.5">
                          {project.code}
                        </span>
                        <span className="text-white font-medium max-w-[150px] truncate">
                          {project.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-semibold">{formatBackupType(backup.backupType)}</span>
                        <span className="text-slate-400 text-[10px] mt-0.5">
                          {formatLocationType(backup.locationType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 max-w-[200px]">
                        <Link className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-slate-300 font-mono truncate text-[11px]" title={backup.destinationPath}>
                          {backup.destinationPath}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                          backup.status
                        )}`}
                      >
                        {backup.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {backup.verifiedAt ? (
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                          <span>{new Date(backup.verifiedAt).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-[160px] truncate" title={backup.notes}>
                      {backup.notes ? (
                        <div className="flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                          <span>{backup.notes}</span>
                        </div>
                      ) : (
                        <span className="text-slate-700 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(backup)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                          title="Edit backup record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(backup.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete backup record"
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
