import React, { useState, useEffect } from 'react';
import { mockLeads, mockSequenceSteps, mockTemplates, mockPendingFollowUps } from '../mockData';
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
import { Sparkles, MessageSquare, Compass, LayoutGrid, CheckSquare, Loader2, Plus, X } from 'lucide-react';
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
    isBackendLead: true,
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

  // Leads & UI states
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'sequence' | 'templates' | 'approvals'>('pipeline');
  const [isInquiryFormOpen, setIsInquiryFormOpen] = useState(false);

  // Backend integration states
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [sequences, setSequences] = useState<FollowUpSequence[]>([]);
  const [steps, setSteps] = useState<FollowUpStep[]>([]);
  const [dueTasks, setDueTasks] = useState<FollowUpTask[]>([]);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);

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

  const refreshSequenceSteps = async () => {
    const activeSeq = sequences.find(s => s.active) || sequences[0];
    if (activeSeq) {
      try {
        const fetchedSteps = await fetchFollowUpSteps(activeSeq.id);
        setSteps(fetchedSteps);
      } catch (err) {
        console.warn('Failed to refresh sequence steps:', err);
      }
    }
  };
  
  const [apiStatus, setApiStatus] = useState<'connected' | 'offline' | 'empty'>('offline');
  const [leadApiStatus, setLeadApiStatus] = useState<'connected' | 'empty' | 'offline'>('offline');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLeadsLoading, setIsLeadsLoading] = useState<boolean>(true);

  // Quotations, Clients, Projects integration states
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  
  // Quotation form modal states
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Partial<Quotation> | null>(null);
  const [isQuotationSaving, setIsQuotationSaving] = useState(false);
  const [quotationFormError, setQuotationFormError] = useState<string | null>(null);

  const refreshLeads = async () => {
    setIsLeadsLoading(true);
    try {
      const fetchedLeads = await fetchLeads();
      if (fetchedLeads && fetchedLeads.length > 0) {
        setLeadApiStatus('connected');
        setLeads(fetchedLeads.map(l => mapLeadResponseToLead(l)));
      } else {
        setLeadApiStatus('empty');
        setLeads(mockLeads.map(l => ({ ...l, isBackendLead: false })));
      }
    } catch (e) {
      console.warn('Failed to fetch leads from backend:', e);
      setLeadApiStatus('offline');
      setLeads(mockLeads.map(l => ({ ...l, isBackendLead: false })));
    } finally {
      setIsLeadsLoading(false);
    }
  };

  const refreshQuotations = async () => {
    try {
      const list = await quotationsApi.list();
      setQuotations(list);
    } catch (e) {
      console.warn('Failed to fetch quotations:', e);
    }
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
      await Promise.all([refreshLeads(), refreshQuotations()]);
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

      await Promise.all([refreshLeads(), refreshQuotations()]);
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
      await Promise.all([refreshLeads(), refreshQuotations()]);
    } catch (err: any) {
      setQuotationFormError(err.message || 'Failed to delete quotation.');
    } finally {
      setIsQuotationSaving(false);
    }
  };

  // Load configuration details from backend (fallback to mock data)
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setIsLeadsLoading(true);
        const fetchedTemplates = await fetchMessageTemplates();
        const fetchedSequences = await fetchFollowUpSequences();

        let fetchedTasks: FollowUpTask[] = [];
        let fetchedLogs: CommunicationLog[] = [];
        try {
          fetchedTasks = await fetchDueFollowUpTasks();
          fetchedLogs = await fetchCommunicationLogs();
        } catch (e) {
          console.warn('Failed to fetch follow-up tasks or communication logs:', e);
        }

        // Fetch Quotations, Clients, and Projects
        try {
          const [qtns, clts, prjs] = await Promise.all([
            quotationsApi.list(),
            fetchClients(),
            fetchProjects()
          ]);
          if (active) {
            setQuotations(qtns);
            setClients(clts);
            setProjects(prjs);
          }
        } catch (e) {
          console.warn('Failed to fetch quotations, clients, or projects on mount:', e);
        }

        // Fetch Leads
        try {
          const fetchedLeads = await fetchLeads();
          if (active) {
            if (fetchedLeads && fetchedLeads.length > 0) {
              setLeadApiStatus('connected');
              setLeads(fetchedLeads.map(l => mapLeadResponseToLead(l)));
            } else {
              setLeadApiStatus('empty');
              setLeads(mockLeads.map(l => ({ ...l, isBackendLead: false })));
            }
          }
        } catch (e) {
          console.warn('Failed to fetch leads from backend:', e);
          if (active) {
            setLeadApiStatus('offline');
            setLeads(mockLeads.map(l => ({ ...l, isBackendLead: false })));
          }
        }

        if (!active) return;

        if (fetchedTemplates.length === 0 || fetchedSequences.length === 0) {
          // Connected but no database records yet
          setApiStatus('empty');
          setTemplates(mockTemplates);
          // Set mock sequence steps mapped to follow-up step layout
          const mockStepsMapped = mockSequenceSteps.map(step => ({
            id: step.id,
            studioId: 'mock-studio',
            sequenceId: 'mock-sequence',
            stepOrder: mockSequenceSteps.indexOf(step) + 1,
            delayDays: step.delayDays,
            channel: step.channel,
            templateId: step.templateType, // map mock type to ID for preview
            goal: step.goal,
            active: step.active
          }));
          setSteps(mockStepsMapped);
          setSequences([{
            id: 'mock-sequence',
            studioId: 'mock-studio',
            name: 'Default 10-Day Sequence (Demo)',
            description: 'Standard follow-up sequence after sending quotation.',
            active: true
          }]);
        } else {
          // Connected and records found
          setApiStatus('connected');
          setTemplates(fetchedTemplates);
          setSequences(fetchedSequences);

          // Retrieve step configurations for the active sequence
          const activeSeq = fetchedSequences.find(s => s.active) || fetchedSequences[0];
          if (activeSeq) {
            const fetchedSteps = await fetchFollowUpSteps(activeSeq.id);
            if (active) {
              setSteps(fetchedSteps);
            }
          }
        }

        if (active) {
          setDueTasks(fetchedTasks);
          setCommunicationLogs(fetchedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (err) {
        console.warn('Backend Follow-up API offline, using fallback mock data:', err);
        if (!active) return;
        setApiStatus('offline');
        setLeadApiStatus('offline');
        setLeads(mockLeads.map(l => ({ ...l, isBackendLead: false })));
        setTemplates(mockTemplates);
        // Map mock sequence steps
        const mockStepsMapped = mockSequenceSteps.map(step => ({
          id: step.id,
          studioId: 'mock-studio',
          sequenceId: 'mock-sequence',
          stepOrder: mockSequenceSteps.indexOf(step) + 1,
          delayDays: step.delayDays,
          channel: step.channel,
          templateId: '', 
          templateType: step.templateType, // preserve for fallback in FollowUpTimeline
          goal: step.goal,
          active: step.active
        }));
        setSteps(mockStepsMapped as any);
        setSequences([{
          id: 'mock-sequence',
          studioId: 'mock-studio',
          name: 'Default 10-Day Sequence (Demo)',
          description: 'Standard follow-up sequence after sending quotation.',
          active: true
        }]);
        setDueTasks([]);
        setCommunicationLogs([]);
      } finally {
        if (active) {
          setIsLoading(false);
          setIsLeadsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const handleMoveLeadStage = async (
    leadId: string, 
    stage: LeadPipelineStage, 
    lostReason?: LeadLostReason, 
    notes?: string
  ): Promise<void> => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (lead.isBackendLead) {
      // Call move-stage API
      await moveLeadStage(leadId, {
        pipelineStage: stage,
        lostReason: lostReason || (stage === 'LOST' ? 'OTHER' : undefined),
        notes
      });
      // After success, refetch leads
      try {
        const fetched = await fetchLeads();
        setLeads(fetched.map(l => mapLeadResponseToLead(l)));
        setLeadApiStatus(fetched.length > 0 ? 'connected' : 'empty');
      } catch (err) {
        console.error('Failed to refetch leads after stage move:', err);
      }
    } else {
      // Fallback mock lead: update local React state only
      const todayStr = new Date().toISOString().split('T')[0];
      const newHistory = [
        ...(lead.history || []),
        { 
          date: todayStr, 
          event: `Moved stage to ${stage}`, 
          status: 'system' as const 
        }
      ];

      const updatedLead: Lead = {
        ...lead,
        stage: stage as any,
        lostReason: lostReason as any,
        notes: notes || lead.notes,
        lastContacted: todayStr,
        urgencyDays: stage === 'CONFIRMED' || stage === 'LOST' ? 99 : lead.urgencyDays,
        nextFollowUp: stage === 'CONFIRMED' ? 'Completed' : stage === 'LOST' ? 'Archived' : lead.nextFollowUp,
        history: newHistory
      };
      
      handleUpdateLead(updatedLead);
    }
  };

  const handleActionSuccess = async () => {
    // Re-fetch tasks and logs on action trigger to refresh values
    if (apiStatus === 'connected' || apiStatus === 'empty') {
      try {
        const fetchedTasks = await fetchDueFollowUpTasks();
        const fetchedLogs = await fetchCommunicationLogs();
        setDueTasks(fetchedTasks);
        setCommunicationLogs(fetchedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
    setLeads(leads.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
  };

  // Determine fallback modes
  const isBackendActive = apiStatus === 'connected' || apiStatus === 'empty';
  const usingMockTasks = !isBackendActive || dueTasks.length === 0;

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
  
  const backendDueToday = dueTasks.filter(t => getDueStatusHelper(t.scheduledAt) === 'due_today').length;
  const backendOverdue = dueTasks.filter(t => getDueStatusHelper(t.scheduledAt) === 'overdue').length;

  const dueTodayCount = !usingMockTasks
    ? backendDueToday
    : mockPendingFollowUps.filter((p) => p.dueStatus === 'due_today').length;

  const overdueCount = !usingMockTasks
    ? backendOverdue
    : mockPendingFollowUps.filter((p) => p.dueStatus === 'overdue').length;
  
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

        {/* API Integration Status Badge */}
        <div className="flex flex-wrap items-center gap-2 px-2 py-1">
          {/* Follow-up Automation Badge */}
          {apiStatus === 'connected' && (
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Follow-ups: Connected
            </span>
          )}
          {apiStatus === 'offline' && (
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Follow-ups: Offline
            </span>
          )}
          {apiStatus === 'empty' && (
            <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Follow-ups: Empty
            </span>
          )}

          {/* Leads API Status Badge */}
          {leadApiStatus === 'connected' && (
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Leads loaded from backend
            </span>
          )}
          {leadApiStatus === 'empty' && (
            <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Empty backend: showing demo leads
            </span>
          )}
          {leadApiStatus === 'offline' && (
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Offline: using demo leads
            </span>
          )}
        </div>
      </div>

      {/* Active Tab Screen */}
      <div className="w-full">
        {activeTab === 'pipeline' && (
          isLeadsLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[#0b1222]/30 border border-slate-800/40 rounded-2xl">
              <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
              <span className="text-slate-400 text-xs font-semibold">Loading pipeline from database...</span>
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
          <FollowUpTimeline 
            steps={steps} 
            templates={templates}
            sequenceName={sequences[0]?.name}
            sequenceId={sequences[0]?.id}
            userRole={user?.role}
            onRefresh={refreshSequenceSteps}
          />
        )}
        {activeTab === 'templates' && !isLoading && (
          <MessageTemplatesPage isEmbedded={true} />
        )}
        {activeTab === 'approvals' && !isLoading && (
          <PendingFollowUpsPanel 
            initialTasks={mockPendingFollowUps} 
            backendTasks={dueTasks}
            communicationLogs={communicationLogs}
            isBackendMode={!usingMockTasks}
            onActionSuccess={handleActionSuccess}
          />
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
      />

      {/* Quotation Form modal */}
      {isQuotationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
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
