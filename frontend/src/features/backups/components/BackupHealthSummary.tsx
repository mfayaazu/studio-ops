import React from 'react';
import { Database, CheckCircle, AlertTriangle, CloudOff, AlertCircle } from 'lucide-react';
import type { BackupRecord } from '../types';
import type { Project } from '../../projects/types';

interface BackupHealthSummaryProps {
  backups: BackupRecord[];
  projects: Project[];
}

export const BackupHealthSummary: React.FC<BackupHealthSummaryProps> = ({ backups, projects }) => {
  const totalRecords = backups.length;
  const completedCount = backups.filter(b => b.status === 'COMPLETED').length;
  const failedCount = backups.filter(b => b.status === 'FAILED' || b.status === 'NEEDS_ATTENTION').length;

  const completedBackups = backups.filter(b => b.status === 'COMPLETED');
  
  // Projects with missing completed cloud backups (S3)
  const projectsWithCloud = new Set(
    completedBackups
      .filter(b => b.locationType === 'CLOUD_S3')
      .map(b => b.projectId)
  );
  const missingCloudCount = projects.filter(p => !projectsWithCloud.has(p.id)).length;

  // Projects with exactly 1 completed location type
  const projectsLocationTypes: Record<string, Set<string>> = {};
  completedBackups.forEach(b => {
    if (!projectsLocationTypes[b.projectId]) {
      projectsLocationTypes[b.projectId] = new Set();
    }
    projectsLocationTypes[b.projectId].add(b.locationType);
  });

  const singleLocationCount = projects.filter(p => {
    const locations = projectsLocationTypes[p.id];
    return locations && locations.size === 1;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {/* Total Backups */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-lg">
        <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Backups</p>
          <p className="text-2xl font-bold text-white mt-1">{totalRecords}</p>
        </div>
      </div>

      {/* Completed Backups */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-lg">
        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-white mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Failed / Needs Attention */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-lg">
        <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Issues / Failed</p>
          <p className="text-2xl font-bold text-white mt-1">{failedCount}</p>
        </div>
      </div>

      {/* Missing Cloud */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-lg">
        <div className={`p-3 rounded-lg ${missingCloudCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
          <CloudOff className="h-6 w-6" />
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Missing Cloud</p>
          <p className={`text-2xl font-bold mt-1 ${missingCloudCount > 0 ? 'text-amber-400' : 'text-white'}`}>
            {missingCloudCount}
          </p>
        </div>
      </div>

      {/* Single Location */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-lg">
        <div className={`p-3 rounded-lg ${singleLocationCount > 0 ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Single Location</p>
          <p className={`text-2xl font-bold mt-1 ${singleLocationCount > 0 ? 'text-orange-400' : 'text-white'}`}>
            {singleLocationCount}
          </p>
        </div>
      </div>
    </div>
  );
};
