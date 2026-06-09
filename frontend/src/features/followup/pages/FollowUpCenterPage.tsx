import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FollowUpSummaryCards } from '../components/FollowUpSummaryCards';
import { FollowUpPipelineBoard } from '../components/FollowUpPipelineBoard';
import { FollowUpTimeline } from '../components/FollowUpTimeline';
import { MessageTemplatesPage } from './MessageTemplatesPage';
import { useAuth } from '../../auth/AuthProvider';
import { PendingFollowUpsPanel } from '../components/PendingFollowUpsPanel';
import { LeadDetailDrawer } from '../components/LeadDetailDrawer';
import type { 
  Lead, 
  FollowUpSequence, 
  FollowUpStep, 
  MessageTemplate, 
  FollowUpTask, 
  CommunicationLog,
  LeadResponse,
  LeadPipelineStage,
  LeadLostReason,
  ChannelType
} from '../types';
import { 
  fetchMessageTemplates, 
  fetchFollowUpSequences, 
  fetchFollowUpSteps,
  fetchDueFollowUpTasks,
  fetchCommunicationLogs,
  fetchLeads,
  moveLeadStage,
  createLead,
  convertLeadToProject
} from '../api/followupApi';
import { Sparkles, MessageSquare, Compass, LayoutGrid, CheckSquare, Loader2, Plus, X, AlertTriangle } from 'lucide-react';
import { NewInquiryForm } from '../components/NewInquiryForm';
import { fetchClients } from '../../clients/api/clientsApi';
import type { ClientResponse } from '../../clients/types';
import { fetchProjects } from '../../projects/api/projectsApi';
import type { ProjectResponse } from '../../projects/types';
import { QuotationForm } from '../../quotations/components/QuotationForm';
import { quotationsApi } from '../../quotations/api/quotationsApi';
import type { Quotation, QuotationCreateRequest, QuotationStatus } from '../../quotations/types';

const mapLeadResponseToLead = (response: LeadResponse): Lead => {
  const eventDateStr = response.eventDate || '';
  const nextFollowUpDateStr = response.nextFollowUpAt ? response.nextFollowUpAt.split('T')[0] : '';
  const lastContactedDateStr = response.lastContactedAt ? response.lastContactedAt.split('T')[0] : '';
  
  // Calculate urgency days based on nextFollowUpAt vs today
  let urgencyDays = 99; // Default for CONFIRMED/LOST
  if (response.pipelineStage !== 'CONFIRMED' && response.pipelineStage !== 'LOST' && response.nextFollowUpAt) {
    const nextDate = new Date(response.nextFollowUpAt);
    const today = new Date();
    const nextZero = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = nextZero.getTime() - todayZero.getTime();
    urgencyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Heuristically assign priority based on estimatedValue
  let priority: 'low' | 'medium' | 'high' = 'low';
  const val = response.estimatedValue || 0;
  if (val >= 150000) {
    priority = 'high';
  } else if (val >= 75000) {
    priority = 'medium';
  }

  // Heuristically map preferredChannel to ChannelType
  let channel: ChannelType = 'EMAIL';
  if (response.preferredChannel === 'WHATSAPP') channel = 'WHATSAPP';
  else if (response.preferredChannel === 'SMS') channel = 'SMS';
  else if (response.preferredChannel === 'PHONE_CALL') channel = 'MANUAL_CALL';
  else if (response.preferredChannel === 'MANUAL') channel = 'MANUAL_CALL';

  return {
    id: response.id,
    clientName: response.clientName,
    projectTitle: response.eventType || 'Untitled Inquiry',
    estimatedValue: response.estimatedValue || 0,
    eventDate: eventDateStr,
    lastContacted: lastContactedDateStr || 'N/A',
    nextFollowUp: response.pipelineStage === 'CONFIRMED' ? 'Completed' : response.pipelineStage === 'LOST' ? 'Archived' : (nextFollowUpDateStr || 'N/A'),
    channel,
    stage: response.pipelineStage,
    priority,
    urgencyDays,
    notes: response.notes,
    sequenceName: 'Backend Sequence',
    history: [], // History is not stored as array in backend lead currently, can keep empty
    
    // Original backend fields preserved
    phone: response.phone,
    email: response.email,
    city: response.city,
    leadSource: response.leadSource,
    lostReason: response.lostReason,
    lastContactedAt: response.lastContactedAt,
    nextFollowUpAt: response.nextFollowUpAt,
    clientId: response.clientId,
    projectId: response.projectId,
    studioId: response.studioId,
    convertedAt: response.convertedAt,
  };
};

export const FollowUpCenterPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // UI States
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'sequence' | 'templates' | 'approvals'>('pipeline');
  const [isInquiryFormOpen, setIsInquiryFormOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Partial<Quotation> | null>(null);
  const [isQuotationSaving, setIsQuotationSaving] = useState(false);
  const [quotationFormError, setQuotationFormError] = useState<string | null>(null);

  // Parse hash parameters to switch to correct tab on redirects
  useEffect(() => {
    const parseHashTab = () => {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const queryString = hash.split('?')[1];
        const params = new URLSearchParams(queryString);
        const tabParam = params.get('tab');
        if (tabParam === 'templates') {
          setActiveTab('templates');
        } else if (tabParam === 'sequence') {
          setActiveTab('sequence');
        } else if (tabParam === 'approvals') {
          setActiveTab('approvals');
        } else if (tabParam === 'pipeline') {
          setActiveTab('pipeline');
        }
      }
    };

    parseHashTab();
    window.addEventListener('hashchange', parseHashTab);
    return () => window.removeEventListener('hashchange', parseHashTab);
  }, []);

  // TanStack Queries
  // 1. Leads (staleTime 30s)
  const { data: rawLeads = [], isLoading: isLeadsLoading, isError: isErrorLeads } = useQuery<LeadResponse[]>({
    queryKey: ['leads'],
    queryFn: () => fetchLeads(),
    staleTime: 30000,
  });

  // 2. Message Templates (staleTime 5 mins)
  const { data: templates = [], isLoading: loadingTemplates, isError: isErrorTemplates } = useQuery<MessageTemplate[]>({
    queryKey: ['message-templates'],
    queryFn: fetchMessageTemplates,
    staleTime: 300000,
  });

  // 3. Sequences (staleTime 5 mins)
  const { data: sequences = [], isLoading: loadingSequences, isError: isErrorSequences } = useQuery<FollowUpSequence[]>({
    queryKey: ['follow-up-sequences'],
    queryFn: fetchFollowUpSequences,
    staleTime: 300000,
  });

  const activeSequenceId = sequences.find(s => s.active)?.id || sequences[0]?.id;

  // 4. Sequence Steps (staleTime 5 mins)
  const { data: steps = [] } = useQuery<FollowUpStep[]>({
    queryKey: ['follow-up-steps', activeSequenceId],
    queryFn: () => fetchFollowUpSteps(activeSequenceId!),
    enabled: !!activeSequenceId,
    staleTime: 300000,
  });

  // 5. Due Tasks (staleTime 30s)
  const { data: dueTasks = [], isLoading: loadingTasks, isError: isErrorTasks } = useQuery<FollowUpTask[]>({
    queryKey: ['due-tasks'],
    queryFn: fetchDueFollowUpTasks,
    staleTime: 30000,
  });

  // 6. Comm Logs (staleTime 30s)
  const { data: communicationLogsRaw = [], isLoading: loadingLogs } = useQuery<CommunicationLog[]>({
    queryKey: ['communication-logs'],
    queryFn: () => fetchCommunicationLogs(),
    staleTime: 30000,
  });

  // 7. Quotations (staleTime 30s)
  const { data: quotations = [], isLoading: loadingQuotations } = useQuery<Quotation[]>({
    queryKey: ['quotations'],
    queryFn: () => quotationsApi.list(),
    staleTime: 30000,
  });

  // 8. Clients (staleTime 60s)
  const { data: clients = [], isLoading: loadingClients } = useQuery<ClientResponse[]>({
    queryKey: ['clients'],
    queryFn: () => fetchClients(),
    staleTime: 60000,
  });

  // 9. Projects (staleTime 60s)
  const { data: projects = [], isLoading: loadingProjects } = useQuery<ProjectResponse[]>({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(),
    staleTime: 60000,
  });

  // Derived arrays
  const leads = rawLeads.map(l => mapLeadResponseToLead(l));
  const communicationLogs = [...communicationLogsRaw].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Derived loading / error / status states
  const isLoading = isLeadsLoading || loadingTemplates || loadingSequences || loadingTasks || loadingLogs || loadingQuotations || loadingClients || loadingProjects;
  
  const leadApiStatus = isErrorLeads ? 'offline' : rawLeads.length > 0 ? 'connected' : 'empty';
  const tasksApiStatus = isErrorTasks ? 'offline' : dueTasks.length > 0 || communicationLogs.length > 0 ? 'connected' : 'empty';
  const templatesApiStatus = isErrorTemplates ? 'offline' : templates.length > 0 ? 'connected' : 'empty';
  const sequencesApiStatus = isErrorSequences ? 'offline' : sequences.length > 0 ? 'connected' : 'empty';
  const apiStatus = isErrorTemplates || isErrorSequences ? 'offline' : templates.length === 0 && sequences.length === 0 ? 'empty' : 'connected';
  const hasError = isErrorLeads && isErrorTemplates && isErrorSequences && isErrorTasks;

  // Refresh functions
  const refreshLeads = async () => {
    await queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  const refreshSequenceSteps = async () => {
    if (activeSequenceId) {
      await queryClient.invalidateQueries({ queryKey: ['follow-up-steps', activeSequenceId] });
    }
  };

  const loadData = async () => {
    await queryClient.invalidateQueries();
  };

  const handleRetry = () => {
    loadData();
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
        await handleMoveLeadStage(
          leadId, 
          targetStage, 
          lostReason, 
          `Lead stage updated automatically via quotation status change to ${status}.`
        );
      } catch (err) {
        console.warn('Failed to sync lead stage with quotation status:', err);
      }
    }
  };

  const handleCreateQuotationForLead = (lead: Lead) => {
    setQuotationFormError(null);
    
    const suggestedTitle = lead.projectTitle 
      ? `${lead.projectTitle} Proposal` 
      : 'Estimate Proposal';
      
    const prefilledData: Partial<Quotation> = {
      title: suggestedTitle,
      leadId: lead.id,
      clientId: lead.clientId || undefined,
      subtotal: lead.estimatedValue || 0,
      currency: 'INR',
      status: 'DRAFT'
    };
    
    setEditingQuotation(prefilledData);
    setIsQuotationModalOpen(true);
  };

  const handleEditQuotationForLead = (qtn: Quotation) => {
    setQuotationFormError(null);
    setEditingQuotation(qtn);
    setIsQuotationModalOpen(true);
  };

  const handleSaveQuotation = async (payload: QuotationCreateRequest) => {
    setQuotationFormError(null);
    setIsQuotationSaving(true);
    try {
      let savedQuotation: Quotation;
      if (editingQuotation && 'id' in editingQuotation && editingQuotation.id) {
        savedQuotation = await quotationsApi.update(editingQuotation.id, payload);
      } else {
        savedQuotation = await quotationsApi.create(payload);
      }
      
      if (savedQuotation.leadId) {
        await syncLeadStage(savedQuotation.leadId, savedQuotation.status);
      }

      setIsQuotationModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    } catch (err: any) {
      setQuotationFormError(err.message || 'Error occurred while saving quotation.');
    } finally {
      setIsQuotationSaving(false);
    }
  };

  const handleUpdateQuotationStatus = async (status: QuotationStatus) => {
    if (!editingQuotation || !('id' in editingQuotation) || !editingQuotation.id) return;
    setQuotationFormError(null);
    setIsQuotationSaving(true);
    try {
      const updated = await quotationsApi.updateStatus(editingQuotation.id, status);
      setEditingQuotation(updated);
      
      if (updated.leadId) {
        await syncLeadStage(updated.leadId, status);
      }

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    } catch (err: any) {
      setQuotationFormError(err.message || 'Failed to update quotation status.');
    } finally {
      setIsQuotationSaving(false);
    }
  };

  const handleDeleteQuotation = async (id: string, quotationNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${quotationNumber || 'this quotation'}?`)) {
      return;
    }
    setQuotationFormError(null);
    setIsQuotationSaving(true);
    try {
      await quotationsApi.delete(id);
      setIsQuotationModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    } catch (err: any) {
      setQuotationFormError(err.message || 'Failed to delete quotation.');
    } finally {
      setIsQuotationSaving(false);
    }
  };


  const handleMoveLeadStage = async (
    leadId: string, 
    stage: LeadPipelineStage, 
    lostReason?: LeadLostReason, 
    notes?: string
  ): Promise<void> => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Call move-stage API
    await moveLeadStage(leadId, {
      pipelineStage: stage,
      lostReason: lostReason || (stage === 'LOST' ? 'OTHER' : undefined),
      notes
    });
    // After success, refetch leads
    try {
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch (err) {
      console.error('Failed to refetch leads after stage move:', err);
    }
  };

  const handleActionSuccess = async () => {
    // Re-fetch tasks and logs on action trigger to refresh values
    if (apiStatus === 'connected' || apiStatus === 'empty') {
      try {
        await queryClient.invalidateQueries({ queryKey: ['due-tasks'] });
        await queryClient.invalidateQueries({ queryKey: ['communication-logs'] });
      } catch (err) {
        console.error('Failed to refetch pending tasks or logs:', err);
      }
    }
  };

  // Find currently selected lead
  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;

  // Handle lead update (e.g. status transition or sending message)
  const handleConvertToProject = async (leadId: string): Promise<string> => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return '';

    // Send minimal payload as requested
    const title = lead.projectTitle ? `${lead.projectTitle} - ${lead.clientName}` : `Event - ${lead.clientName}`;
    const payload = {
      title,
      notes: lead.notes || undefined
    };

    const response = await convertLeadToProject(leadId, payload);
    await refreshLeads();
    return response.message;
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    queryClient.setQueryData<LeadResponse[]>(['leads'], (oldLeads) => {
      if (!oldLeads) return [];
      return oldLeads.map((ol) => {
        if (ol.id === updatedLead.id) {
          return {
            ...ol,
            lastContactedAt: updatedLead.lastContacted === 'N/A' ? undefined : new Date(updatedLead.lastContacted).toISOString(),
            nextFollowUpAt: updatedLead.nextFollowUp === 'Completed' || updatedLead.nextFollowUp === 'Archived' || updatedLead.nextFollowUp === 'N/A' ? undefined : new Date(updatedLead.nextFollowUp).toISOString(),
          };
        }
        return ol;
      });
    });
  };

  const getDueStatusHelper = (scheduledAt: string): 'due_today' | 'overdue' | 'upcoming' => {
    const scheduledDate = new Date(scheduledAt);
    const today = new Date();
    const scheduledZero = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = scheduledZero.getTime() - todayZero.getTime();
    if (diffTime < 0) {
      return 'overdue';
    } else if (diffTime === 0) {
      return 'due_today';
    } else {
      return 'upcoming';
    }
  };

  // Calculate stats dynamically from state
  const openLeads = leads.filter((l) => l.stage !== 'CONFIRMED' && l.stage !== 'LOST');
  const leadsInFunnel = openLeads.length;
  
  const dueTodayCount = dueTasks.filter(t => getDueStatusHelper(t.scheduledAt) === 'due_today').length;
  const overdueCount = dueTasks.filter(t => getDueStatusHelper(t.scheduledAt) === 'overdue').length;
  
  const warmLeadsCount = leads.filter((l) => l.stage === 'WARM').length;
  const estimatedOpenValue = openLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0);

  const formattedToday = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="space-y-8 pb-12">
      {/* Header and Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-radial-gradient from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-heading font-extrabold text-white tracking-wide">
              Follow-up Automation Center
            </h2>
            <Sparkles className="h-5 w-5 text-indigo-400 animate-bounce" />
          </div>
          <p className="text-slate-400 text-xs font-mono">{formattedToday}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInquiryFormOpen(true)}
            className="py-2 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Inquiry</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Funnel Active
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Row */}
      <FollowUpSummaryCards
        leadsInFunnel={leadsInFunnel}
        dueTodayCount={dueTodayCount}
        warmLeadsCount={warmLeadsCount}
        overdueCount={overdueCount}
        estimatedOpenValue={estimatedOpenValue}
      />

      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-1.5 gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 ${
              activeTab === 'pipeline'
                ? 'border-violet-500 text-white bg-violet-600/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Pipeline Board</span>
          </button>
          <button
            onClick={() => setActiveTab('sequence')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 ${
              activeTab === 'sequence'
                ? 'border-violet-500 text-white bg-violet-600/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Sequence Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 ${
              activeTab === 'templates'
                ? 'border-violet-500 text-white bg-violet-600/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Message Templates</span>
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 ${
              activeTab === 'approvals'
                ? 'border-violet-500 text-white bg-violet-600/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Pending Approvals ({dueTodayCount + overdueCount})</span>
          </button>
        </div>

        {/* API Integration Status Badges */}
        <div className="flex flex-wrap items-center gap-2 px-2 py-1">
          {/* Leads API Status Badge */}
          {leadApiStatus === 'connected' && (
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono animate-fadeIn">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Leads: Connected
            </span>
          )}
          {leadApiStatus === 'empty' && (
            <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Leads: Empty
            </span>
          )}
          {leadApiStatus === 'offline' && (
            <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Leads: Offline
            </span>
          )}

          {/* Follow-up Tasks API Status Badge */}
          {tasksApiStatus === 'connected' && (
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Follow-ups: Connected
            </span>
          )}
          {tasksApiStatus === 'empty' && (
            <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Follow-ups: Empty
            </span>
          )}
          {tasksApiStatus === 'offline' && (
            <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Follow-ups: Offline
            </span>
          )}

          {/* Templates API Status Badge */}
          {templatesApiStatus === 'connected' && (
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Templates: Connected
            </span>
          )}
          {templatesApiStatus === 'empty' && (
            <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Templates: Empty
            </span>
          )}
          {templatesApiStatus === 'offline' && (
            <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Templates: Offline
            </span>
          )}

          {/* Sequence API Status Badge */}
          {sequencesApiStatus === 'connected' && (
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sequence: Connected
            </span>
          )}
          {sequencesApiStatus === 'empty' && (
            <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Sequence: Empty
            </span>
          )}
          {sequencesApiStatus === 'offline' && (
            <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Sequence: Offline
            </span>
          )}
        </div>
      </div>

      {/* Active Tab Screen */}
      <div className="w-full">
        {hasError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4 my-8">
            <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
            <h3 className="text-white font-semibold text-sm">Connection Error</h3>
            <p className="text-xs text-slate-400">
              Unable to load follow-up data. Check API connection and retry.
            </p>
            <button 
              onClick={handleRetry}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'pipeline' && (
              isLeadsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[#0b1222]/30 border border-slate-800/40 rounded-2xl">
                  <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                  <span className="text-slate-400 text-xs font-semibold">Loading pipeline from database...</span>
                </div>
              ) : leadApiStatus === 'offline' ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#0b1222]/30 border border-slate-800/40 rounded-2xl space-y-4">
                  <AlertTriangle className="h-10 w-10 text-rose-500 animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-250">Leads Offline</h3>
                    <p className="text-xs text-slate-455 max-w-sm leading-relaxed">
                      Unable to retrieve leads from backend database. Please check your network connection.
                    </p>
                  </div>
                  <button
                    onClick={refreshLeads}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md"
                  >
                    Retry Loading Leads
                  </button>
                </div>
              ) : leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#0b1222]/30 border border-slate-800/40 rounded-2xl space-y-4">
                  <MessageSquare className="h-10 w-10 text-slate-650" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-200">No Leads Found</h3>
                    <p className="text-xs text-slate-450 max-w-sm leading-relaxed">
                      No leads yet. Register your first lead to start the WhatsApp follow-up workflow.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsInquiryFormOpen(true)}
                    className="py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md"
                  >
                    Register First Lead
                  </button>
                </div>
              ) : (
                <FollowUpPipelineBoard 
                  leads={leads} 
                  onLeadClick={(leadId) => setSelectedLeadId(leadId)} 
                />
              )
            )}
            
            {activeTab !== 'pipeline' && isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[#0b1222]/30 border border-slate-800/40 rounded-2xl">
                <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                <span className="text-slate-400 text-xs font-semibold">Loading from database...</span>
              </div>
            )}
            
            {activeTab === 'sequence' && !isLoading && (
              sequencesApiStatus === 'offline' ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#0b1222]/30 border border-slate-800/40 rounded-2xl space-y-4">
                  <AlertTriangle className="h-10 w-10 text-rose-500 animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-250">Sequence Offline</h3>
                    <p className="text-xs text-slate-455 max-w-sm leading-relaxed">
                      Unable to load follow-up sequences from the database. Please check your network connection.
                    </p>
                  </div>
                  <button
                    onClick={loadData}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md"
                  >
                    Retry Loading Sequence
                  </button>
                </div>
              ) : (
                <FollowUpTimeline 
                  steps={steps} 
                  templates={templates}
                  sequenceName={sequences[0]?.name}
                  sequenceId={sequences[0]?.id}
                  userRole={user?.role}
                  onRefresh={refreshSequenceSteps}
                />
              )
            )}
            {activeTab === 'templates' && !isLoading && (
              <MessageTemplatesPage isEmbedded={true} />
            )}
            {activeTab === 'approvals' && !isLoading && (
              tasksApiStatus === 'offline' ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#0b1222]/30 border border-slate-800/40 rounded-2xl space-y-4">
                  <AlertTriangle className="h-10 w-10 text-rose-500 animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-250">Follow-ups Offline</h3>
                    <p className="text-xs text-slate-455 max-w-sm leading-relaxed">
                      Unable to retrieve pending follow-up tasks from the database. Please check your network connection.
                    </p>
                  </div>
                  <button
                    onClick={loadData}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md"
                  >
                    Retry Loading Tasks
                  </button>
                </div>
              ) : (
                <PendingFollowUpsPanel 
                  backendTasks={dueTasks}
                  communicationLogs={communicationLogs}
                  onActionSuccess={handleActionSuccess}
                  leads={leads}
                />
              )
            )}
          </>
        )}
      </div>

      {/* Lead Detail Drawer overlay */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
        onUpdateLead={handleUpdateLead}
        onMoveStage={(stage, lostReason, notes) => handleMoveLeadStage(selectedLeadId!, stage, lostReason, notes)}
        onConvertToProject={handleConvertToProject}
        quotations={quotations}
        onCreateQuotation={handleCreateQuotationForLead}
        onEditQuotation={handleEditQuotationForLead}
        templates={templates}
      />

      {/* Quotation Form modal */}
      {isQuotationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full w-[min(92vw,1100px)] max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20 flex-shrink-0">
              <h3 className="text-white font-semibold text-base">
                {editingQuotation && 'id' in editingQuotation && editingQuotation.id ? 'Modify Proposal' : 'New Estimate Proposal'}
              </h3>
              <button
                onClick={() => setIsQuotationModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="p-6 overflow-y-auto flex-1">
              <QuotationForm
                initialData={editingQuotation as Quotation}
                clients={clients}
                projects={projects}
                leads={leads.map(l => ({
                  id: l.id,
                  clientName: l.clientName,
                  eventType: l.projectTitle
                })) as any}
                onSubmit={handleSaveQuotation}
                onUpdateStatus={handleUpdateQuotationStatus}
                onCancel={() => setIsQuotationModalOpen(false)}
                isSubmitting={isQuotationSaving}
                submitError={quotationFormError}
                onDelete={handleDeleteQuotation}
              />
            </div>
          </div>
        </div>
      )}

      {/* New Inquiry Drawer Form */}
      <NewInquiryForm
        isOpen={isInquiryFormOpen}
        onClose={() => setIsInquiryFormOpen(false)}
        onSubmit={async (payload) => {
          await createLead(payload);
          await refreshLeads();
        }}
      />
    </main>
  );
};
