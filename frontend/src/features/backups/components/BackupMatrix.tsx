import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';
import type { BackupRecord, BackupType, BackupLocationType } from '../types';
import type { Project } from '../../projects/types';

interface BackupMatrixProps {
  projects: Project[];
  backups: BackupRecord[];
}

const BACKUP_TYPES: { value: BackupType; label: string }[] = [
  { value: 'RAW_PHOTOS', label: 'Raw Photos' },
  { value: 'RAW_VIDEOS', label: 'Raw Videos' },
  { value: 'EDITED_PHOTOS', label: 'Edited Photos' },
  { value: 'FINAL_VIDEO', label: 'Final Video' },
  { value: 'ALBUM_FILES', label: 'Album Files' },
  { value: 'FINAL_DELIVERY', label: 'Final Delivery' },
  { value: 'PROJECT_ARCHIVE', label: 'Project Archive' },
];

const LOCATION_TYPES: { value: BackupLocationType; label: string }[] = [
  { value: 'LOCAL_NAS', label: 'Local NAS' },
  { value: 'EXTERNAL_HARD_DRIVE', label: 'External Drive' },
  { value: 'CLOUD_S3', label: 'Cloud S3' },
];

export const BackupMatrix: React.FC<BackupMatrixProps> = ({ projects, backups }) => {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const toggleProject = (projectId: string) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  const getCellStatus = (projectBackups: BackupRecord[], type: BackupType, location: BackupLocationType) => {
    const matching = projectBackups.filter(b => b.backupType === type && b.locationType === location);
    if (matching.length === 0) {
      return { status: 'MISSING', label: 'Missing', class: 'bg-slate-800/40 text-slate-500 border-slate-800' };
    }

    // Prioritize showing issues or completions
    if (matching.some(b => b.status === 'FAILED' || b.status === 'NEEDS_ATTENTION')) {
      return { status: 'FAILED', label: 'Failed / Attention', class: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    }
    if (matching.some(b => b.status === 'COMPLETED')) {
      return { status: 'COMPLETED', label: 'Completed', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    return { status: 'PENDING', label: 'In Progress', class: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-4">Project Backup Matrix</h2>
      {projects.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
          No projects found.
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => {
            const projectBackups = backups.filter(b => b.projectId === project.id);
            const isExpanded = expandedProjectId === project.id;

            // Simple status counts for the header summary
            const completedCount = projectBackups.filter(b => b.status === 'COMPLETED').length;
            const issuesCount = projectBackups.filter(b => b.status === 'FAILED' || b.status === 'NEEDS_ATTENTION').length;
            const hasCloud = projectBackups.some(b => b.locationType === 'CLOUD_S3' && b.status === 'COMPLETED');

            return (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-200"
              >
                {/* Header */}
                <button
                  onClick={() => toggleProject(project.id)}
                  className="w-full px-6 py-4 flex flex-col md:flex-row md:items-center justify-between text-left hover:bg-slate-800/40 transition-colors gap-4"
                >
                  <div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mr-2">
                      {project.projectCode}
                    </span>
                    <h3 className="inline-block text-white font-semibold text-sm">{project.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Type: {project.projectType}</p>
                  </div>

                  <div className="flex items-center space-x-6 text-xs self-start md:self-auto">
                    {/* Cloud status pill */}
                    <span
                      className={`px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                        hasCloud
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${hasCloud ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span>{hasCloud ? 'Cloud Secured' : 'No Cloud Backup'}</span>
                    </span>

                    {/* Completion status pill */}
                    <span className="text-slate-400">
                      <strong className="text-white">{completedCount}</strong> Completed
                    </span>

                    {/* Issues status pill */}
                    {issuesCount > 0 && (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{issuesCount} Attention</span>
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950 p-6 overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-3 font-semibold">Backup Type</th>
                          {LOCATION_TYPES.map(loc => (
                            <th key={loc.value} className="pb-3 font-semibold text-center w-1/4">
                              {loc.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {BACKUP_TYPES.map(type => (
                          <tr key={type.value} className="hover:bg-slate-900/40">
                            <td className="py-3 font-medium text-slate-300">{type.label}</td>
                            {LOCATION_TYPES.map(loc => {
                              const cell = getCellStatus(projectBackups, type.value, loc.value);
                              return (
                                <td key={loc.value} className="py-3 text-center">
                                  <div
                                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-[11px] font-medium ${cell.class}`}
                                  >
                                    {cell.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {cell.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                                    {cell.status === 'FAILED' && <XCircle className="w-3.5 h-3.5" />}
                                    {cell.status === 'MISSING' && <HelpCircle className="w-3.5 h-3.5" />}
                                    <span>{cell.label}</span>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
