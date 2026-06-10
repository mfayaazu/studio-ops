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
import { formatCurrencyINR } from '../../../lib/formatters';

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
    priority: response.priority || 'NORMAL',
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

    // CRM Enhancements
    paymentStatus: response.paymentStatus || 'UNPAID',
    quotationTotal: response.quotationTotal || 0,
    amountPaid: response.amountPaid || 0,
    amountRemaining: response.amountRemaining || 0,
    eventSegments: response.eventSegments || [],
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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL');
  const [filterEventType, setFilterEventType] = useState('ALL');
  const [filterDueDate, setFilterDueDate] = useState('ALL');
  const [filterEventDate, setFilterEventDate] = useState('ALL');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    return localStorage.getItem('crm_compact_view') === 'true';
  });

  // Track active sequence in timeline config
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null);

  const handleToggleCompact = () => {
    setIsCompact(prev => {
      const next = !prev;
      localStorage.setItem('crm_compact_view', String(next));
      return next;
    });
  };

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

  const activeSequenceId = selectedSequenceId || sequences.find(s => s.active)?.id || sequences[0]?.id;

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

  // Extract unique event types
  const allEventTypes = Array.from(new Set(
    leads.flatMap(l => (l.eventSegments || []).map(seg => seg.eventType).filter(Boolean))
  ));

  // Helper for due date calculation
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

  // Filter leads based on Search Query and dropdown filters
  const filteredLeads = leads.filter(lead => {
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase().trim();
      const leadQuotations = quotations.filter(q => q.leadId === lead.id);
      const matchesQuotation = leadQuotations.some(q => 
        q.quotationNumber?.toLowerCase().includes(queryLower)
      );
      
      const matchesSearch = 
        lead.clientName.toLowerCase().includes(queryLower) ||
        (lead.phone && lead.phone.toLowerCase().includes(queryLower)) ||
        (lead.email && lead.email.toLowerCase().includes(queryLower)) ||
        lead.projectTitle.toLowerCase().includes(queryLower) ||
        (lead.city && lead.city.toLowerCase().includes(queryLower)) ||
        lead.stage.toLowerCase().includes(queryLower) ||
        matchesQuotation;
        
      if (!matchesSearch) return false;
    }
    
    if (filterStage !== 'ALL' && lead.stage !== filterStage) return false;
    if (filterPriority !== 'ALL' && lead.priority !== filterPriority) return false;
    if (filterPaymentStatus !== 'ALL' && lead.paymentStatus !== filterPaymentStatus) return false;
    
    if (filterEventType !== 'ALL') {
      const hasEventType = lead.eventSegments?.some(seg => seg.eventType === filterEventType) || lead.projectTitle === filterEventType;
      if (!hasEventType) return false;
    }
    
    if (filterDueDate !== 'ALL') {
      if (!lead.nextFollowUpAt) return false;
      const dueStatus = getDueStatusHelper(lead.nextFollowUpAt);
      if (filterDueDate === 'OVERDUE' && dueStatus !== 'overdue') return false;
      if (filterDueDate === 'TODAY' && dueStatus !== 'due_today') return false;
      if (filterDueDate === 'UPCOMING' && dueStatus !== 'upcoming') return false;
    }

    if (filterEventDate !== 'ALL') {
      if (!lead.eventDate) return false;
      const evDate = new Date(lead.eventDate);
      const today = new Date();
      const diffTime = evDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (filterEventDate === '30_DAYS' && (diffDays < 0 || diffDays > 30)) return false;
      if (filterEventDate === '90_DAYS' && (diffDays < 0 || diffDays > 90)) return false;
      if (filterEventDate === 'OVERDUE' && diffDays >= 0) return false;
    }
    
    return true;
  });

  // Refresh functions
  const refreshLeads = async () => {
    await queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  const refreshSequenceSteps = async () => {
    if (activeSequenceId) {
      await queryClient.invalidateQueries({ queryKey: ['follow-up-steps', activeSequenceId] });
      await queryClient.invalidateQueries({ queryKey: ['follow-up-sequences'] });
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
      subtotal: lead.quotationTotal || lead.estimatedValue || 0,
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

  const handleConvertToProject = async (leadId: string): Promise<string> => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return '';

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
            priority: updatedLead.priority,
            paymentStatus: updatedLead.paymentStatus,
            quotationTotal: updatedLead.quotationTotal,
            amountPaid: updatedLead.amountPaid,
            amountRemaining: updatedLead.amountRemaining,
            eventSegments: updatedLead.eventSegments,
          };
        }
        return ol;
      });
    });
  };

  // Calculate stats dynamically from state
  const openLeads = leads.filter((l) => l.stage !== 'CONFIRMED' && l.stage !== 'LOST');
  const leadsInFunnel = openLeads.length;
  
  const dueTodayCount = dueTasks.filter(t => getDueStatusHelper(t.scheduledAt) === 'due_today').length;
  const overdueCount = dueTasks.filter(t => getDueStatusHelper(t.scheduledAt) === 'overdue').length;
  
  const warmLeadsCount = leads.filter((l) => l.stage === 'WARM').length;
  const estimatedOpenValue = openLeads.reduce((sum, lead) => sum + (lead.quotationTotal || lead.estimatedValue || 0), 0);

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
            className="py-2 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
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

      {/* Search and Filters Section */}
      {activeTab === 'pipeline' && (
        <div className="bg-[#0b1222]/40 border border-slate-800/60 rounded-2xl p-4 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search bar */}
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                placeholder="Search leads by name, phone, email, event, city, quotation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070b14]/80 border border-slate-800 text-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Toggles & Compact button */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => setViewMode(viewMode === 'board' ? 'list' : 'board')}
                className="px-3.5 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{viewMode === 'board' ? 'Switch to List' : 'Switch to Board'}</span>
              </button>
              {viewMode === 'board' && (
                <button
                  onClick={handleToggleCompact}
                  className={`px-3.5 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCompact 
                      ? 'bg-violet-600 border-violet-500 text-white font-bold' 
                      : 'bg-slate-900 border-slate-850 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>Compact Cards</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter selects row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {/* Stage filter */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Stage</label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 text-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
              >
                <option value="ALL">All Stages</option>
                <option value="NEW_LEAD">New Inquiry</option>
                <option value="QUOTE_SENT">Quote Sent</option>
                <option value="WARM">Warm Lead</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="FOLLOW_UP_PENDING">Follow-up Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            {/* Priority filter */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 text-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">LOW</option>
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            {/* Payment Status filter */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Payment</label>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 text-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
              >
                <option value="ALL">All Payments</option>
                <option value="UNPAID">UNPAID</option>
                <option value="ADVANCE_PAID">ADVANCE PAID</option>
                <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                <option value="PAID">PAID</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            {/* Event Type filter */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Event Type</label>
              <select
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 text-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
              >
                <option value="ALL">All Event Types</option>
                {allEventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Follow-up Due filter */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Follow-up Due</label>
              <select
                value={filterDueDate}
                onChange={(e) => setFilterDueDate(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 text-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
              >
                <option value="ALL">All Times</option>
                <option value="OVERDUE">Overdue Only</option>
                <option value="TODAY">Due Today</option>
                <option value="UPCOMING">Upcoming Only</option>
              </select>
            </div>

            {/* Event Date filter */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Event Date</label>
              <select
                value={filterEventDate}
                onChange={(e) => setFilterEventDate(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 text-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
              >
                <option value="ALL">All Dates</option>
                <option value="30_DAYS">Next 30 Days</option>
                <option value="90_DAYS">Next 90 Days</option>
                <option value="OVERDUE">Completed/Past Events</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
                viewMode === 'board' ? (
                  <FollowUpPipelineBoard 
                    leads={filteredLeads} 
                    steps={steps}
                    isCompact={isCompact}
                    onLeadClick={(leadId) => setSelectedLeadId(leadId)} 
                  />
                ) : (
                  <div className="bg-[#0b1222]/50 border border-slate-800/60 rounded-2xl p-4 shadow-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs text-slate-350">
                      <thead>
                        <tr className="border-b border-slate-850 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                          <th className="py-3 px-4 font-bold">Client Name</th>
                          <th className="py-3 px-4 font-bold">Primary Event</th>
                          <th className="py-3 px-4 font-bold">Stage</th>
                          <th className="py-3 px-4 font-bold">Priority</th>
                          <th className="py-3 px-4 font-bold">Payment</th>
                          <th className="py-3 px-4 font-bold">Next Follow-up</th>
                          <th className="py-3 px-4 font-bold">Total / Remaining</th>
                          <th className="py-3 px-4 font-bold">City</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.map(lead => (
                          <tr 
                            key={lead.id} 
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="border-b border-slate-850/40 hover:bg-[#121c35]/40 transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-4 font-bold text-slate-200">{lead.clientName}</td>
                            <td className="py-3 px-4 font-medium">{lead.projectTitle}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/50">
                                {lead.stage}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/50">
                                {lead.priority}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/50">
                                {lead.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px]">{lead.nextFollowUp}</td>
                            <td className="py-3 px-4 font-mono font-medium text-slate-300">
                              <div>{formatCurrencyINR(lead.quotationTotal)}</div>
                              <div className="text-[10px] text-slate-500">Rem: {formatCurrencyINR(lead.amountRemaining)}</div>
                            </td>
                            <td className="py-3 px-4">{lead.city || 'TBD'}</td>
                          </tr>
                        ))}
                        {filteredLeads.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                              No leads match current search and filter settings.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )
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
                  sequenceName={sequences.find(s => s.id === activeSequenceId)?.name}
                  sequenceId={activeSequenceId}
                  userRole={user?.role}
                  onRefresh={refreshSequenceSteps}
                  sequences={sequences}
                  activeSequenceId={activeSequenceId}
                  onChangeSequence={(id) => setSelectedSequenceId(id)}
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
