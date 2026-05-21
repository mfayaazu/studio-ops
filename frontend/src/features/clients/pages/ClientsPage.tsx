import React, { useEffect, useState } from 'react';
import { clientsApi } from '../api/clientsApi';
import type { ClientResponse, ClientCreateRequest } from '../types';
import { Users, Search, Plus, Trash2, Edit3, X, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientResponse | null>(null);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchClients = (search?: string) => {
    setLoading(true);
    clientsApi.list(search)
      .then((res) => {
        setClients(res);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch clients');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchClients();
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: ClientResponse) => {
    setEditingClient(client);
    setFullName(client.fullName);
    setPhone(client.phone);
    setEmail(client.email || '');
    setNotes(client.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !phone.trim()) {
      setFormError('Full Name and Phone Number are required fields.');
      return;
    }

    const payload: ClientCreateRequest = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined
    };

    try {
      if (editingClient) {
        await clientsApi.update(editingClient.id, payload);
      } else {
        await clientsApi.create(payload);
      }
      setIsModalOpen(false);
      fetchClients(searchTerm);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving client data.');
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete client "${name}"?`)) {
      return;
    }
    
    try {
      await clientsApi.delete(id);
      fetchClients(searchTerm);
    } catch (err: any) {
      alert(err.message || 'Failed to delete client.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Client Directory</h2>
          <p className="text-slate-400 text-xs mt-1">Manage accounts, contact details, and client project records</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Client</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
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

      {/* Clients List/Table */}
      <div className="bg-[#0d1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono animate-pulse">Loading clients database...</div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No clients found</p>
            <p className="text-slate-500 text-xs mt-1">Try refining your search query or create a new client profile</p>
          </div>
        ) : (
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
                    <td className="px-6 py-4 font-semibold text-white text-sm">{client.fullName}</td>
                    <td className="px-6 py-4 text-xs font-mono">
                      <div>{client.phone}</div>
                      <div className="text-slate-500 mt-0.5">{client.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{formatDate(client.createdAt)}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate" title={client.notes}>
                      {client.notes || <span className="text-slate-600 italic">No notes</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id, client.fullName)}
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
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20">
              <h3 className="text-white font-semibold text-base">
                {editingClient ? 'Edit Client Profile' : 'New Client Registration'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
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
                  placeholder="e.g. Fayaaz Ali"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. client@example.com"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions or background information..."
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
                  {editingClient ? 'Save Changes' : 'Register Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
