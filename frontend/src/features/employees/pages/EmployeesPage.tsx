import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employeesApi';
import type { Employee, EmployeeCreateRequest } from '../types';
import { EmployeeForm } from '../components/EmployeeForm';
import { EmployeeList } from '../components/EmployeeList';
import { ClipboardList, Search, Plus, X, AlertTriangle } from 'lucide-react';
import * as authApi from '../../auth/api/authApi';
import { useDebounce } from '../../../hooks/useDebounce';

export const EmployeesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Employees query (staleTime 60s)
  const { data: employees = [], isLoading: loading, error: queryError } = useQuery<Employee[]>({
    queryKey: ['employees', debouncedSearchTerm],
    queryFn: () => fetchEmployees(debouncedSearchTerm),
    staleTime: 60000,
  });

  const error = queryError ? (queryError as any).message || 'Failed to fetch employees' : null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ['employees', debouncedSearchTerm] });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (
    payload: EmployeeCreateRequest,
    permissionsOverrides?: { pageKey: string; accessLevel: string }[]
  ) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      let savedEmployee: Employee;
      if (editingEmployee) {
        savedEmployee = await updateEmployee(editingEmployee.id, payload);
      } else {
        savedEmployee = await createEmployee(payload);
      }

      if (permissionsOverrides && savedEmployee.userId) {
        await authApi.updateUserPermissions(savedEmployee.userId, permissionsOverrides);
      }

      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['employees'] });

      if (savedEmployee.inviteWarning) {
        alert(savedEmployee.inviteWarning);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving employee data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"?`)) {
      return;
    }
    
    try {
      await deleteEmployee(id);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch (err: any) {
      alert(err.message || 'Failed to delete employee.');
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
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
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

      {/* Employees List/Table */}
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
          <EmployeeList
            employees={employees}
            onEdit={openEditModal}
            onDelete={handleDeleteEmployee}
          />
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full w-[min(92vw,980px)] max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20 flex-none">
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

            {/* Form Container */}
            <div className="p-6 overflow-hidden flex-1 flex flex-col min-h-0 bg-[#0d1424]">
              <EmployeeForm
                initialData={editingEmployee}
                onSubmit={handleSaveEmployee}
                onCancel={() => setIsModalOpen(false)}
                isSubmitting={isSubmitting}
                submitError={formError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
