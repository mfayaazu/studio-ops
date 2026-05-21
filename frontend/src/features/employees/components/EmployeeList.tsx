import React from 'react';
import type { Employee, EmployeeStatus } from '../types';
import { Edit3, Trash2 } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string, name: string) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onEdit,
  onDelete,
}) => {
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
                <div className="font-semibold text-white text-sm">
                  {emp.fullName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  {emp.email} {emp.phone && `• ${emp.phone}`}
                </div>
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
              <td className="px-6 py-4 text-xs text-slate-400 text-nowrap">
                {formatDate(emp.createdAt)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(emp)}
                    className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(emp.id, emp.fullName)}
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
  );
};
