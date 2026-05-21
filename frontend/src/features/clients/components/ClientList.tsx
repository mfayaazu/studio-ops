import React from 'react';
import type { Client } from '../types';
import { Edit3, Trash2 } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string, name: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/40">
            <th className="px-6 py-4">Client Name</th>
            <th className="px-6 py-4">Contact Info</th>
            <th className="px-6 py-4">Registered Date</th>
            <th className="px-6 py-4">Notes</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 text-slate-300">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-slate-800/10 transition-colors">
              <td className="px-6 py-4 font-semibold text-white text-sm">
                {client.fullName}
              </td>
              <td className="px-6 py-4 text-xs font-mono">
                <div>{client.phone}</div>
                <div className="text-slate-500 mt-0.5">{client.email || '—'}</div>
              </td>
              <td className="px-6 py-4 text-xs text-slate-400 text-nowrap">
                {formatDate(client.createdAt)}
              </td>
              <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate" title={client.notes}>
                {client.notes || <span className="text-slate-600 italic">No notes</span>}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(client)}
                    className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(client.id, client.fullName)}
                    className="p-1.5 rounded bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Client"
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
