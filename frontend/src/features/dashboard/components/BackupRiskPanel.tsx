import React from 'react';
import type { BackupRecord } from '../../backups/types';
import type { Project } from '../../projects/types';
import { Database, AlertTriangle, ShieldCheck, HardDrive, CloudOff } from 'lucide-react';

interface BackupRiskPanelProps {
  backups: BackupRecord[];
  projects: Project[];
}

export const BackupRiskPanel: React.FC<BackupRiskPanelProps> = ({ backups, projects }) => {
  const activeProjects = projects.filter(
    (p) => p.status !== 'CANCELLED' && p.status !== 'ARCHIVED'
  );

  const failedCount = backups.filter((b) => b.status === 'FAILED').length;
  const needsAttentionCount = backups.filter((b) => b.status === 'NEEDS_ATTENTION').length;

  // Projects missing completed CLOUD_S3 backups
  const missingCloudProjects = activeProjects.filter((p) => {
    const projectBackups = backups.filter((b) => b.projectId === p.id);
    const hasCloudBackup = projectBackups.some(
      (b) => b.locationType === 'CLOUD_S3' && b.status === 'COMPLETED'
    );
    return !hasCloudBackup;
  });

  // Projects with exactly 1 completed backup location
  const singleLocationProjects = activeProjects.filter((p) => {
    const projectBackups = backups.filter((b) => b.projectId === p.id && b.status === 'COMPLETED');
    const locations = new Set(projectBackups.map((b) => b.locationType));
    return locations.size === 1;
  });

  const totalRisks = failedCount + needsAttentionCount + missingCloudProjects.length + singleLocationProjects.length;

  return (
    <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-6 flex flex-col h-full shadow-lg">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-base flex items-center gap-2">
          <Database className="h-5 w-5 text-fuchsia-400" />
          Backup & Media Safety
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">Asset redundancy audit and data-loss risks</p>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-between">
        {totalRisks === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-emerald-500/20 bg-emerald-500/5 rounded-lg">
            <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-emerald-400 text-sm font-semibold">All backups are secured</p>
            <p className="text-slate-500 text-xs mt-1">Multi-site cloud and NAS redundancy active.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Failed and Attention KPI Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border flex flex-col justify-between ${
                failedCount > 0 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                  : 'bg-slate-900/40 border-slate-850 text-slate-400'
              }`}>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Failed Backups</span>
                <span className="text-base font-bold mt-1">{failedCount}</span>
              </div>
              <div className={`p-3 rounded-lg border flex flex-col justify-between ${
                needsAttentionCount > 0 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                  : 'bg-slate-900/40 border-slate-850 text-slate-400'
              }`}>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Attention Items</span>
                <span className="text-base font-bold mt-1">{needsAttentionCount}</span>
              </div>
            </div>

            {/* Risk Warnings List */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {missingCloudProjects.length > 0 && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-start gap-2.5">
                  <CloudOff className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-white font-semibold">Missing Cloud Backups ({missingCloudProjects.length})</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">
                      {missingCloudProjects.map(p => p.projectCode).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {singleLocationProjects.length > 0 && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-start gap-2.5">
                  <HardDrive className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-white font-semibold">Single Location Only ({singleLocationProjects.length})</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">
                      {singleLocationProjects.map(p => p.projectCode).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-900/40 border border-slate-850 p-2.5 rounded-lg justify-center mt-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          <span>Minimum of 2 backup locations (NAS + Cloud) is recommended.</span>
        </div>
      </div>
    </div>
  );
};
