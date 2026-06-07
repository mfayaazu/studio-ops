import React, { useEffect, useState } from 'react';
import { Plus, LayoutGrid, List, AlertTriangle, Search, X } from 'lucide-react';
import { deliverablesApi } from '../api/deliverablesApi';
import { projectsApi } from '../../projects/api/projectsApi';
import { fetchEmployees } from '../../employees/api/employeesApi';
import type { Deliverable, DeliverableCreateRequest, DeliverableUpdateRequest, DeliverableType, DeliverableStatus } from '../types';
import type { Project } from '../../projects/types';
import type { Employee } from '../../employees/types';
import { DeliverableSummary } from '../components/DeliverableSummary';
import { DeliverableBoard } from '../components/DeliverableBoard';
import { DeliverableList } from '../components/DeliverableList';
import { DeliverableForm } from '../components/DeliverableForm';

const DELIVERABLE_TYPES: { value: DeliverableType; label: string }[] = [
  { value: 'PHOTOS', label: 'Photos' },
  { value: 'TEASER', label: 'Teaser' },
  { value: 'FULL_VIDEO', label: 'Full Video' },
  { value: 'ALBUM_SELECTION', label: 'Album Selection' },
  { value: 'ALBUM_DESIGN', label: 'Album Design' },
  { value: 'HARD_DISK', label: 'Hard Disk' },
  { value: 'OTHER', label: 'Other' },
];

const DELIVERABLE_STATUSES: { value: DeliverableStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_FOR_CLIENT', label: 'Waiting for Client' },
  { value: 'READY_FOR_REVIEW', label: 'Ready for Review' },
  { value: 'REVISION_REQUIRED', label: 'Revision Required' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const DeliverablesPage: React.FC = () => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state: 'board' | 'list'
  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProjectId, setFilterProjectId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Deliverable | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deliverablesList, projectsList, employeesList] = await Promise.all([
        deliverablesApi.list(),
        projectsApi.list(),
        fetchEmployees().catch(e => {
          console.warn('Failed to fetch employees for deliverable lookup:', e);
          return [] as Employee[];
        }),
      ]);
      setDeliverables(deliverablesList);
      setProjects(projectsList);
      setEmployees(employeesList);
    } catch (err: any) {
      setError(err?.message || 'Failed to load deliverables data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingRecord(null);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (record: Deliverable) => {
    setEditingRecord(record);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (payload: DeliverableCreateRequest | DeliverableUpdateRequest) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (editingRecord) {
        await deliverablesApi.update(editingRecord.id, payload as DeliverableUpdateRequest);
      } else {
        await deliverablesApi.create(payload as DeliverableCreateRequest);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setSaveError(err?.message || 'Error occurred while saving deliverable.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deliverablesApi.delete(id);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete deliverable.');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterProjectId('');
    setFilterStatus('');
    setFilterType('');
  };

  // Filter deliverables client-side
  const filteredDeliverables = deliverables.filter(d => {
    const matchesSearch = !searchQuery.trim() || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.referenceUrl && d.referenceUrl.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesProject = !filterProjectId || d.projectId === filterProjectId;
    const matchesStatus = !filterStatus || d.status === filterStatus;
    const matchesType = !filterType || d.deliverableType === filterType;

    return matchesSearch && matchesProject && matchesStatus && matchesType;
  });

  const hasActiveFilters = searchQuery || filterProjectId || filterStatus || filterType;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Post-Production & Deliverables</h2>
          <p className="text-slate-400 text-xs mt-1">
            Track post-production statuses, media references, client selection phases, and due dates
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={projects.length === 0}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Deliverable</span>
        </button>
      </div>

      {projects.length === 0 && !loading && (
        <div className="bg-amber-500/15 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>You must create at least one project before managing deliverables.</span>
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
          Loading deliverables & metrics...
        </div>
      ) : (
        <>
          {/* Summary Panel */}
          <DeliverableSummary deliverables={deliverables} />

          {/* Controls & Filter Panel */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Toggle Tabs */}
              <div className="flex bg-[#0d1424] p-1 rounded-lg border border-slate-800 self-start md:self-auto">
                <button
                  onClick={() => setActiveTab('board')}
                  className={`px-3 py-1.5 rounded-md font-medium text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                    activeTab === 'board'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span>Kanban Board</span>
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-3 py-1.5 rounded-md font-medium text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                    activeTab === 'list'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span>Table View ({filteredDeliverables.length})</span>
                </button>
              </div>

              {/* Reset filter indicator */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Clear all filters</span>
                </button>
              )}
            </div>

            {/* Detailed Filters Panel */}
            <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              {/* Search Query */}
              <div className="space-y-1.5">
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  Search Name / URL
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search deliverables..."
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Project Filter */}
              <div className="space-y-1.5">
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
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

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  Filter Status
                </label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="">All Statuses</option>
                  {DELIVERABLE_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="space-y-1.5">
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  Filter Type
                </label>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="">All Types</option>
                  {DELIVERABLE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Components */}
            {activeTab === 'board' ? (
              <DeliverableBoard
                deliverables={filteredDeliverables}
                projects={projects}
                employees={employees}
                onEdit={openEditModal}
                onDelete={handleDeleteRecord}
              />
            ) : (
              <DeliverableList
                deliverables={filteredDeliverables}
                projects={projects}
                onEdit={openEditModal}
                onDelete={handleDeleteRecord}
              />
            )}
          </div>
        </>
      )}

      {/* Form Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex justify-between items-center bg-slate-900/20 flex-none">
              <h2 className="text-lg font-semibold text-white">
                {editingRecord ? 'Edit Deliverable' : 'Add Deliverable'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <DeliverableForm
                initialData={editingRecord}
                projects={projects}
                onSubmit={handleSaveRecord}
                onCancel={() => setIsModalOpen(false)}
                isSubmitting={isSaving}
                submitError={saveError}
                onDelete={handleDeleteRecord}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
