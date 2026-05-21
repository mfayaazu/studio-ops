import React, { useEffect, useState } from 'react';
import { employeesApi } from '../api/employeesApi';
import type { EmployeeResponse, EmployeeCreateRequest, EmployeeStatus } from '../types';
import { ClipboardList, Search, Plus, Trash2, Edit3, X, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryRole, setPrimaryRole] = useState('');
  const [skills, setSkills] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchEmployees = (search?: string) => {
    setLoading(true);
    employeesApi.list(search)
      .then((res) => {
        setEmployees(res);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch employees');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchEmployees();
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setPrimaryRole('');
    setSkills('');
    setStatus('ACTIVE');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (employee: EmployeeResponse) => {
    setEditingEmployee(employee);
    setFullName(employee.fullName);
    setEmail(employee.email);
    setPhone(employee.phone || '');
    setPrimaryRole(employee.primaryRole);
    setSkills(employee.skills || '');
    setStatus(employee.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !email.trim() || !primaryRole.trim()) {
      setFormError('Full Name, Email, and Primary Role are required fields.');
      return;
    }

    const payload: EmployeeCreateRequest = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      primaryRole: primaryRole.trim(),
      skills: skills.trim() || undefined,
      status
    };

    try {
      if (editingEmployee) {
        await employeesApi.update(editingEmployee.id, payload);
      } else {
        await employeesApi.create(payload);
      }
      setIsModalOpen(false);
      fetchEmployees(searchTerm);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving employee data.');
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"?`)) {
      return;
    }
    
    try {
      await employeesApi.delete(id);
      fetchEmployees(searchTerm);
    } catch (err: any) {
      alert(err.message || 'Failed to delete employee.');
    }
  };

  const getStatusBadgeClass = (status: EmployeeStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'ON_LEAVE':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'INACTIVE':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default:
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Team Allocation</h2>
          <p className="text-slate-400 text-xs mt-1">Manage photographer roster, primary roles, skills, and status tracking</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, role, or skills..."
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

      {/* Employees Table */}
      <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono animate-pulse">Loading employee records...</div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No employees found</p>
            <p className="text-slate-500 text-xs mt-1">Try refining your search query or add a new team member</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/40">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Primary Role</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-sm">{emp.fullName}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">{emp.email} {emp.phone && `• ${emp.phone}`}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-medium">
                        {emp.primaryRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate" title={emp.skills}>
                      {emp.skills || <span className="text-slate-600 italic">None specified</span>}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full border text-[10px] uppercase ${getStatusBadgeClass(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{formatDate(emp.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id, emp.fullName)}
                          className="p-1.5 rounded bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove Employee"
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
          <div className="bg-[#0d1424] border border-slate-850 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20">
              <h3 className="text-white font-semibold text-base">
                {editingEmployee ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Michael Scott"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. michael.scott@studioops.com"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0245"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Primary Role *</label>
                <input
                  type="text"
                  required
                  value={primaryRole}
                  onChange={(e) => setPrimaryRole(e.target.value)}
                  placeholder="e.g. Lead Photographer, Editor, Assistant"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills / Specialty</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Drone, Portrait, Lighting, Video Editing"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="ACTIVE">Active (Available)</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive (Suspended)</option>
                </select>
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
                  {editingEmployee ? 'Save Changes' : 'Add Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
