import React, { useEffect, useState } from 'react';
import { quotationsApi } from '../api/quotationsApi';
import type { Quotation, QuotationCreateRequest, QuotationStatus } from '../types';
import { fetchClients } from '../../clients/api/clientsApi';
import type { ClientResponse } from '../../clients/types';
import { fetchProjects } from '../../projects/api/projectsApi';
import type { ProjectResponse } from '../../projects/types';
import { fetchLeads, moveLeadStage } from '../../followup/api/followupApi';
import type { LeadResponse, LeadPipelineStage, LeadLostReason } from '../../followup/types';
import { QuotationForm } from '../components/QuotationForm';
import { QuotationList } from '../components/QuotationList';
import { formatCurrencyINR } from '../../../lib/formatters';
import { FileText, Plus, X, AlertTriangle, Sparkles, TrendingUp, Send, CheckCircle2, RefreshCw } from 'lucide-react';

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'ALL' | QuotationStatus>('ALL');

  // Modal/Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [quotationList, clientsList, projectsList, leadsList] = await Promise.all([
        quotationsApi.list(),
        fetchClients(),
        fetchProjects(),
        fetchLeads()
      ]);
      setQuotations(quotationList);
      setClients(clientsList);
      setProjects(projectsList);
      setLeads(leadsList);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load quotations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingQuotation(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setFormError(null);
    setIsModalOpen(true);
  };

  const syncLeadStage = async (leadId: string, status: QuotationStatus) => {
    let targetStage: LeadPipelineStage | null = null;
    let lostReason: LeadLostReason | undefined;
    
    if (status === 'SENT') {
      targetStage = 'QUOTE_SENT';
    } else if (status === 'ACCEPTED') {
      targetStage = 'CONFIRMED';
    } else if (status === 'REJECTED') {
      const isNegotiation = window.confirm(
        "Quotation has been rejected. Move the linked lead to NEGOTIATION stage?\n(Click Cancel to mark as LOST)"
      );
      targetStage = isNegotiation ? 'NEGOTIATION' : 'LOST';
      if (!isNegotiation) {
        lostReason = 'OTHER';
      }
    }

    if (targetStage) {
      try {
        /* TODO: Backend automation should eventually enforce lead stage transition on quotation status changes. */
        const leadExists = leads.some(l => l.id === leadId);
        if (leadExists) {
          await moveLeadStage(leadId, {
            pipelineStage: targetStage,
            lostReason,
            notes: `Lead stage updated automatically via quotation status change to ${status}.`
          });
        }
      } catch (err) {
        console.warn('Failed to sync lead stage with quotation status:', err);
      }
    }
  };

  const handleSaveQuotation = async (payload: QuotationCreateRequest) => {
    setFormError(null);
    setIsSaving(true);
    try {
      let saved: Quotation;
      if (editingQuotation) {
        saved = await quotationsApi.update(editingQuotation.id, payload);
      } else {
        saved = await quotationsApi.create(payload);
      }
      
      if (saved.leadId) {
        await syncLeadStage(saved.leadId, saved.status);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving quotation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (status: QuotationStatus) => {
    if (!editingQuotation) return;
    setFormError(null);
    setIsSaving(true);
    try {
      const updated = await quotationsApi.updateStatus(editingQuotation.id, status);
      setEditingQuotation(updated);
      
      if (updated.leadId) {
        await syncLeadStage(updated.leadId, status);
      }

      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update quotation status.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuotation = async (id: string, quotationNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${quotationNumber || 'this quotation'}?`)) {
      return;
    }
    setFormError(null);
    setIsSaving(true);
    try {
      await quotationsApi.delete(id);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to delete quotation.');
    } finally {
      setIsSaving(false);
    }
  };

  // Metrics (computed from full quotations list)
  const totalCount = quotations.length;
  const draftCount = quotations.filter((q) => q.status === 'DRAFT').length;
  const sentCount = quotations.filter((q) => q.status === 'SENT').length;
  const acceptedCount = quotations.filter((q) => q.status === 'ACCEPTED').length;
  const acceptedValue = quotations
    .filter((q) => q.status === 'ACCEPTED')
    .reduce((sum, q) => sum + (q.totalAmount || 0), 0);

  // Locally filtered quotations for display
  const displayedQuotations = quotations.filter((q) => {
    if (statusFilter === 'ALL') return true;
    return q.status === statusFilter;
  });

  const filters: { value: 'ALL' | QuotationStatus; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SENT', label: 'Sent' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Quotations</h2>
          <p className="text-slate-400 text-xs mt-1">Estimate services, manage package proposals, and track client approvals</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            title="Refresh proposal pipeline"
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-450 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Proposal Count</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-200 font-mono">{totalCount}</span>
            <FileText className="h-4 w-4 text-slate-600 ml-auto" />
          </div>
        </div>

        <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Draft Proposals</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-400 font-mono">{draftCount}</span>
            <Sparkles className="h-4 w-4 text-slate-650 ml-auto" />
          </div>
        </div>

        <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Sent / Pending</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-violet-400 font-mono">{sentCount}</span>
            <Send className="h-4 w-4 text-violet-600/60 ml-auto" />
          </div>
        </div>

        <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Accepted proposals</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-450 font-mono">{acceptedCount}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600/60 ml-auto" />
          </div>
        </div>

        <div className="bg-[#0d1424] border border-slate-800/80 rounded-2xl p-4 col-span-2 md:col-span-1 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Accepted Revenue</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-200 font-mono truncate">{formatCurrencyINR(acceptedValue)}</span>
            <TrendingUp className="h-4 w-4 text-emerald-500 ml-auto flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/30 border border-slate-850/50 rounded-xl max-w-fit">
        {filters.map((filter) => {
          const isActive = statusFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Error block */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-455 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 text-sm">{error}</div>
          <button
            onClick={fetchData}
            className="text-xs font-bold text-rose-350 hover:underline cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Quotations List */}
      <div>
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono animate-pulse">Loading proposal list...</div>
        ) : (
          <QuotationList
            quotations={displayedQuotations}
            clients={clients}
            projects={projects}
            leads={leads}
            onEdit={openEditModal}
          />
        )}
      </div>

      {/* Form modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20 flex-shrink-0">
              <h3 className="text-white font-semibold text-base">
                {editingQuotation ? 'Modify Proposal' : 'New Estimate Proposal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="p-6 overflow-y-auto flex-1">
              <QuotationForm
                initialData={editingQuotation}
                clients={clients}
                projects={projects}
                leads={leads}
                onSubmit={handleSaveQuotation}
                onUpdateStatus={handleUpdateStatus}
                onCancel={() => setIsModalOpen(false)}
                isSubmitting={isSaving}
                submitError={formError}
                onDelete={handleDeleteQuotation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
