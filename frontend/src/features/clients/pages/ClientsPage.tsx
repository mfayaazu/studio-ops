import React, { useEffect, useState } from 'react';
import { fetchClients, createClient, updateClient, deleteClient } from '../api/clientsApi';
import type { Client, ClientCreateRequest } from '../types';
import { ClientForm } from '../components/ClientForm';
import { ClientList } from '../components/ClientList';
import { Users, Search, Plus, X, AlertTriangle } from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFetchClients = (search?: string) => {
    setLoading(true);
    fetchClients(search)
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
    handleFetchClients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchClients(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    handleFetchClients();
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (payload: ClientCreateRequest) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingClient) {
        await updateClient(editingClient.id, payload);
      } else {
        await createClient(payload);
      }
      setIsModalOpen(false);
      handleFetchClients(searchTerm);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving client data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete client "${name}"?`)) {
      return;
    }
    
    try {
      await deleteClient(id);
      handleFetchClients(searchTerm);
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
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
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
          <ClientList
            clients={clients}
            onEdit={openEditModal}
            onDelete={handleDeleteClient}
          />
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

            {/* Form Container */}
            <div className="p-6">
              <ClientForm
                initialData={editingClient}
                onSubmit={handleSaveClient}
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
