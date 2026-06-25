import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, createProject, updateProject, deleteProject } from '../api/projectsApi';
import type { Project, ProjectCreateRequest } from '../types';
import { fetchClients } from '../../clients/api/clientsApi';
import type { ClientResponse } from '../../clients/types';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectList } from '../components/ProjectList';
import { Briefcase, Search, Plus, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { canEditPage } from '../../auth/permissions';
import { useDebounce } from '../../../hooks/useDebounce';

export const ProjectsPage: React.FC = () => {
  const { user, permissions } = useAuth();
  const isEditable = canEditPage(permissions, 'PROJECTS', user?.role);
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Projects query (staleTime 60s)
  const { data: projects = [], isLoading: loadingProjects, error: errorProjects } = useQuery<Project[]>({
    queryKey: ['projects', debouncedSearchTerm],
    queryFn: () => fetchProjects(debouncedSearchTerm),
    staleTime: 60000,
  });

  // Clients query (staleTime 60s)
  const { data: clients = [], isLoading: loadingClients, error: errorClients } = useQuery<ClientResponse[]>({
    queryKey: ['clients'],
    queryFn: () => fetchClients(),
    staleTime: 60000,
  });

  const loading = loadingProjects || loadingClients;
  const error = errorProjects ? (errorProjects as any).message : errorClients ? (errorClients as any).message : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ['projects', debouncedSearchTerm] });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProject = async (payload: ProjectCreateRequest) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, payload);
      } else {
        await createProject(payload);
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete project ${code}?`)) {
      return;
    }
    
    try {
      await deleteProject(id);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (err: any) {
      alert(err.message || 'Failed to delete project.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Project Workspace</h2>
          <p className="text-slate-400 text-xs mt-1">Track creative photo/video contracts, payments, and workflow pipelines</p>
        </div>
        
        {isEditable && (
          <button
            onClick={openCreateModal}
            disabled={clients.length === 0}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* View-Only Warning */}
      {!isEditable && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 text-sm font-semibold">
            View-only access: You do not have permission to create or edit projects.
          </div>
        </div>
      )}

      {clients.length === 0 && !loading && (
        <div className="bg-amber-500/15 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>You must create at least one client in the Clients directory before establishing a project contract.</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects by title, code, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Projects List/Table */}
      <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono animate-pulse">Loading projects pipeline...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Briefcase className="h-10 w-10 text-slate-600 mx-auto mb-1" />
            <div className="space-y-1">
              <p className="text-slate-350 text-sm font-semibold">
                {searchTerm ? 'No bookings matched your search' : 'Create your first project to track shoots, team assignments, budget, and deliverables.'}
              </p>
              <p className="text-slate-500 text-xs">
                {searchTerm ? 'Try refining search parameters' : 'Manage your photography studio contracts, client data, and assignments in one place'}
              </p>
            </div>
            {!searchTerm && isEditable && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2 px-5 rounded-lg transition-all cursor-pointer shadow-md shadow-violet-500/10"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <ProjectList
            projects={projects}
            clients={clients}
            onEdit={openEditModal}
            onDelete={isEditable ? handleDeleteProject : undefined}
          />
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-48px)] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20 flex-none">
              <h3 className="text-white font-semibold text-base">
                {editingProject ? 'Edit Project Details' : 'New Project Contract'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Container */}
            <div className="p-6 flex-1 min-h-0 flex flex-col overflow-hidden">
              <ProjectForm
                initialData={editingProject}
                clients={clients}
                onSubmit={handleSaveProject}
                onCancel={() => setIsModalOpen(false)}
                isSubmitting={isSubmitting}
                submitError={formError}
                onDelete={handleDeleteProject}
                isReadOnly={!isEditable}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
