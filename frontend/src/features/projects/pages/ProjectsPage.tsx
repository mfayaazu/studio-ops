import React, { useEffect, useState } from 'react';
import { projectsApi } from '../api/projectsApi';
import type { ProjectResponse, ProjectCreateRequest, ProjectStatus, BookingStatus, PaymentStatus } from '../types';
import { clientsApi } from '../../clients/api/clientsApi';
import type { ClientResponse } from '../../clients/types';
import { employeesApi } from '../../employees/api/employeesApi';
import type { EmployeeResponse } from '../../employees/types';
import { Briefcase, Search, Plus, Trash2, Edit3, X, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);
  
  // Form states
  const [clientId, setClientId] = useState('');
  const [assignedProjectManagerId, setAssignedProjectManagerId] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('INQUIRY');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [status, setStatus] = useState<ProjectStatus>('LEAD');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async (search?: string) => {
    setLoading(true);
    try {
      const [projectsList, clientsList, employeesList] = await Promise.all([
        projectsApi.list(search),
        clientsApi.list(),
        employeesApi.list()
      ]);
      setProjects(projectsList);
      setClients(clientsList);
      setEmployees(employeesList);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchData();
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setClientId(clients[0]?.id || '');
    setAssignedProjectManagerId('');
    // Auto-generate project code for preview e.g., PRJ-YYYY-0001
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    setProjectCode(`RSA-${year}-${random}`);
    setTitle('');
    setProjectType('Wedding Photography');
    setBookingStatus('INQUIRY');
    setPaymentStatus('UNPAID');
    setStatus('LEAD');
    setStartDate('');
    setEndDate('');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: ProjectResponse) => {
    setEditingProject(project);
    setClientId(project.clientId);
    setAssignedProjectManagerId(project.assignedProjectManagerId || '');
    setProjectCode(project.projectCode);
    setTitle(project.title);
    setProjectType(project.projectType);
    setBookingStatus(project.bookingStatus);
    setPaymentStatus(project.paymentStatus);
    setStatus(project.status);
    setStartDate(project.startDate || '');
    setEndDate(project.endDate || '');
    setNotes(project.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!clientId || !projectCode.trim() || !title.trim() || !projectType.trim()) {
      setFormError('Client, Project Code, Title, and Project Type are required.');
      return;
    }

    const payload: ProjectCreateRequest = {
      clientId,
      assignedProjectManagerId: assignedProjectManagerId || undefined,
      projectCode: projectCode.trim(),
      title: title.trim(),
      projectType: projectType.trim(),
      bookingStatus,
      paymentStatus,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined
    };

    try {
      if (editingProject) {
        await projectsApi.update(editingProject.id, payload);
      } else {
        await projectsApi.create(payload);
      }
      setIsModalOpen(false);
      fetchData(searchTerm);
    } catch (err: any) {
      setFormError(err.message || 'Error saving project.');
    }
  };

  const handleDeleteProject = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete project ${code}?`)) {
      return;
    }
    
    try {
      await projectsApi.delete(id);
      fetchData(searchTerm);
    } catch (err: any) {
      alert(err.message || 'Failed to delete project.');
    }
  };

  const getClientName = (id: string) => {
    const client = clients.find(c => c.id === id);
    return client ? client.fullName : 'Unknown Client';
  };

  const getManagerName = (id?: string) => {
    if (!id) return 'Not Assigned';
    const employee = employees.find(e => e.id === id);
    return employee ? employee.fullName : 'Not Assigned';
  };

  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case 'LEAD':
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
      case 'CONFIRMED':
        return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
      case 'SCHEDULED':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'SHOOT_COMPLETED':
        return 'bg-violet-500/10 border-violet-500/20 text-violet-400';
      case 'POST_PRODUCTION':
        return 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400';
      case 'DELIVERED':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'ARCHIVED':
        return 'bg-slate-650/10 border-slate-600/25 text-slate-450';
      case 'CANCELLED':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    }
  };

  const getPaymentBadgeClass = (status: PaymentStatus) => {
    switch (status) {
      case 'UNPAID':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'PARTIALLY_PAID':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'FULLY_PAID':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'REFUNDED':
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Project Workspace</h2>
          <p className="text-slate-400 text-xs mt-1">Track creative photo/video contracts, payments, and workflow pipelines</p>
        </div>
        
        <button
          onClick={openCreateModal}
          disabled={clients.length === 0}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {clients.length === 0 && (
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
          <div className="p-12 text-center">
            <Briefcase className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No projects found</p>
            <p className="text-slate-500 text-xs mt-1">Try refining search parameters or create a new project folder</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/40">
                  <th className="px-6 py-4">Project Code & Title</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Project Timeline</th>
                  <th className="px-6 py-4">Booking</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Pipeline Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-violet-400 font-semibold">{proj.projectCode}</div>
                      <div className="font-bold text-white text-sm mt-0.5">{proj.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{proj.projectType}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-300">{getClientName(proj.clientId)}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-450">{getManagerName(proj.assignedProjectManagerId)}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div>Start: {formatDate(proj.startDate)}</div>
                      <div className="text-slate-500 mt-0.5">End: {formatDate(proj.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono uppercase text-slate-400">{proj.bookingStatus.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded border text-[10px] uppercase ${getPaymentBadgeClass(proj.paymentStatus)}`}>
                        {proj.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full border text-[10px] uppercase ${getStatusBadgeClass(proj.status)}`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.projectCode)}
                          className="p-1.5 rounded bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20">
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

            {/* Form */}
            <form onSubmit={handleSaveProject} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Code *</label>
                  <input
                    type="text"
                    required
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Link *</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fayaaz & Fatima - Destination Wedding"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Type *</label>
                  <input
                    type="text"
                    required
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    placeholder="e.g. Wedding, Corporate Event, Portrait Session"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned PM (PM/Staff)</label>
                  <select
                    value={assignedProjectManagerId}
                    onChange={(e) => setAssignedProjectManagerId(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="">No Manager Assigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.primaryRole})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Booking Status</label>
                  <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="INQUIRY">Inquiry</option>
                    <option value="QUOTED">Quoted</option>
                    <option value="CONTRACT_SIGNED">Contract Signed</option>
                    <option value="DEPOSIT_PAID">Deposit Paid</option>
                    <option value="FULLY_BOOKED">Fully Booked</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="FULLY_PAID">Fully Paid</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="LEAD">Lead</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="SHOOT_COMPLETED">Shoot Completed</option>
                    <option value="POST_PRODUCTION">Post Production</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="ARCHIVED">Archived</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Details on requirements, package details, gear restrictions..."
                  rows={3}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
