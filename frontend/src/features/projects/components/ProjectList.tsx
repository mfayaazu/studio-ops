import React from 'react';
import type { Project, ProjectStatus, BookingStatus, PaymentStatus } from '../types';
import type { ClientResponse } from '../../clients/types';
import { Edit3, Trash2 } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface ProjectListProps {
  projects: Project[];
  clients: ClientResponse[];
  onEdit: (project: Project) => void;
  onDelete: (id: string, code: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  clients,
  onEdit,
  onDelete,
}) => {
  const getClientName = (id: string) => {
    const client = clients.find((c) => c.id === id);
    return client ? client.fullName : 'Unknown Client';
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
        return 'bg-slate-600/10 border-slate-600/25 text-slate-500';
      case 'CANCELLED':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-455';
      default:
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
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
        return 'bg-slate-500/10 border-slate-500/20 text-slate-500';
      default:
        return 'bg-slate-550/10 border-slate-550/20 text-slate-400';
    }
  };

  const getBookingBadgeClass = (status: BookingStatus) => {
    switch (status) {
      case 'INQUIRY':
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
      case 'QUOTED':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'CONTRACT_SIGNED':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
      case 'DEPOSIT_PAID':
        return 'bg-pink-500/10 border-pink-500/20 text-pink-400';
      case 'FULLY_BOOKED':
        return 'bg-violet-500/10 border-violet-500/20 text-violet-400';
      default:
        return 'bg-slate-550/10 border-slate-550/20 text-slate-400';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/40">
            <th className="px-6 py-4">Project Code & Title</th>
            <th className="px-6 py-4">Client</th>
            <th className="px-6 py-4">Project Timeline</th>
            <th className="px-6 py-4">Booking</th>
            <th className="px-6 py-4">Payment</th>
            <th className="px-6 py-4">Pipeline Status</th>
            <th className="px-6 py-4">Created Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 text-slate-300">
          {projects.map((proj) => (
            <tr key={proj.id} className="hover:bg-slate-800/10 transition-colors">
              <td className="px-6 py-4">
                <div className="font-mono text-xs text-violet-400 font-semibold">
                  {proj.projectCode}
                </div>
                <div className="font-bold text-white text-sm mt-0.5">
                  {proj.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {proj.projectType}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-300">
                {getClientName(proj.clientId)}
              </td>
              <td className="px-6 py-4 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500 mr-1">Start:</span>
                  {proj.startDate ? formatDate(proj.startDate) : '—'}
                </div>
                <div className="mt-0.5">
                  <span className="text-slate-500 mr-1">End:</span>
                  {proj.endDate ? formatDate(proj.endDate) : '—'}
                </div>
              </td>
              <td className="px-6 py-4 text-xs">
                <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded border text-[10px] uppercase ${getBookingBadgeClass(proj.bookingStatus)}`}>
                  {proj.bookingStatus.replace('_', ' ')}
                </span>
              </td>
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
              <td className="px-6 py-4 text-xs text-slate-400 text-nowrap">
                {formatDate(proj.createdAt)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(proj)}
                    className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit Project"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(proj.id, proj.projectCode)}
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
  );
};
