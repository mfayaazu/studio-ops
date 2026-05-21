import React, { useEffect, useState } from 'react';
import { Plus, Layers, ListFilter, AlertTriangle } from 'lucide-react';
import { backupsApi } from '../api/backupsApi';
import { projectsApi } from '../../projects/api/projectsApi';
import { deliverablesApi } from '../../deliverables/api/deliverablesApi';
import type { BackupRecord, BackupRecordCreateRequest, BackupRecordUpdateRequest } from '../types';
import type { Project } from '../../projects/types';
import type { Deliverable } from '../../deliverables/types';
import { BackupHealthSummary } from '../components/BackupHealthSummary';
import { BackupMatrix } from '../components/BackupMatrix';
import { BackupForm } from '../components/BackupForm';
import { BackupList } from '../components/BackupList';

export const BackupCenterPage: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state: 'matrix' | 'list'
  const [activeTab, setActiveTab] = useState<'matrix' | 'list'>('matrix');

  // Filters for the detailed list view
  const [filterProjectId, setFilterProjectId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BackupRecord | undefined>(undefined);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [backupsList, projectsList, deliverablesList] = await Promise.all([
        backupsApi.list(),
        projectsApi.list(),
        deliverablesApi.list(),
      ]);
      setBackups(backupsList);
      setProjects(projectsList);
      setDeliverables(deliverablesList);
    } catch (err: any) {
      setError(err?.message || 'Failed to load backup data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingRecord(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (record: BackupRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (payload: any) => {
    try {
      if (editingRecord) {
        // Edit mode payload is BackupRecordUpdateRequest
        await backupsApi.update(editingRecord.id, payload as BackupRecordUpdateRequest);
      } else {
        // Create mode payload is BackupRecordCreateRequest
        await backupsApi.create(payload as BackupRecordCreateRequest);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      throw new Error(err?.message || 'Error occurred while saving backup record.');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await backupsApi.delete(id);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete backup record.');
    }
  };

  // Filtered backups for detailed records list
  const filteredBackups = backups.filter(b => {
    const matchesProject = !filterProjectId || b.projectId === filterProjectId;
    const matchesStatus = !filterStatus || b.status === filterStatus;
    return matchesProject && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Backup Center</h2>
          <p className="text-slate-400 text-xs mt-1">
            Audit redundant backup systems, track storage paths, and manage client assets safety checklists
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={projects.length === 0}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Backup Record</span>
        </button>
      </div>

      {projects.length === 0 && !loading && (
        <div className="bg-amber-500/15 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>You must create at least one project before recording backups.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono animate-pulse">
          Loading backup health checks & logs...
        </div>
      ) : (
        <>
          {/* Health Summary Panel */}
          <BackupHealthSummary backups={backups} projects={projects} />

          {/* Toggle Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2.5 font-medium text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'matrix'
                  ? 'border-indigo-500 text-white bg-slate-900/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Project Backup Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2.5 font-medium text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'list'
                  ? 'border-indigo-500 text-white bg-slate-900/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="h-4 w-4" />
              <span>Detailed Logs ({filteredBackups.length})</span>
            </button>
          </div>

          {/* View Components */}
          {activeTab === 'matrix' ? (
            <BackupMatrix projects={projects} backups={backups} />
          ) : (
            <div className="space-y-4">
              {/* Detailed Filters Panel */}
              <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                    Filter Project
                  </label>
                  <select
                    value={filterProjectId}
                    onChange={e => setFilterProjectId(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="">All Projects</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.projectCode}] {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full md:w-48">
                  <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                    Filter Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="NEEDS_ATTENTION">Needs Attention</option>
                  </select>
                </div>

                <div className="flex self-end gap-2 w-full md:w-auto">
                  {(filterProjectId || filterStatus) && (
                    <button
                      onClick={() => {
                        setFilterProjectId('');
                        setFilterStatus('');
                      }}
                      className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer w-full md:w-auto text-center"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Records List Table */}
              <BackupList
                backups={filteredBackups}
                projects={projects}
                onEdit={openEditModal}
                onDelete={handleDeleteRecord}
              />
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      <BackupForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecord}
        initialData={editingRecord}
        projects={projects}
        deliverables={deliverables}
      />
    </div>
  );
};
