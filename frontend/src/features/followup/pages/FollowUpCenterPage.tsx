import React, { useState, useEffect } from 'react';
import { mockLeads, mockSequenceSteps, mockTemplates, mockPendingFollowUps } from '../mockData';
import { FollowUpSummaryCards } from '../components/FollowUpSummaryCards';
import { FollowUpPipelineBoard } from '../components/FollowUpPipelineBoard';
import { FollowUpTimeline } from '../components/FollowUpTimeline';
import { TemplateCardGrid } from '../components/TemplateCardGrid';
import { PendingFollowUpsPanel } from '../components/PendingFollowUpsPanel';
import { LeadDetailDrawer } from '../components/LeadDetailDrawer';
import type { Lead, FollowUpSequence, FollowUpStep, MessageTemplate } from '../types';
import { 
  fetchMessageTemplates, 
  fetchFollowUpSequences, 
  fetchFollowUpSteps 
} from '../api/followupApi';
import { Sparkles, MessageSquare, Compass, LayoutGrid, CheckSquare, Loader2 } from 'lucide-react';

export const FollowUpCenterPage: React.FC = () => {
  // Leads & UI states
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'sequence' | 'templates' | 'approvals'>('pipeline');

  // Backend integration states
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [sequences, setSequences] = useState<FollowUpSequence[]>([]);
  const [steps, setSteps] = useState<FollowUpStep[]>([]);
  const [apiStatus, setApiStatus] = useState<'connected' | 'offline' | 'empty'>('offline');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load configuration details from backend (fallback to mock data)
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const fetchedTemplates = await fetchMessageTemplates();
        const fetchedSequences = await fetchFollowUpSequences();

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
      } catch (err) {
        console.warn('Backend Follow-up API offline, using fallback mock data:', err);
        if (!active) return;
        setApiStatus('offline');
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
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Find currently selected lead
  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;

  // Handle lead update (e.g. status transition or sending message)
  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(leads.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
  };

  // Calculate stats dynamically from state
  const openLeads = leads.filter((l) => l.stage !== 'CONFIRMED' && l.stage !== 'LOST');
  const leadsInFunnel = openLeads.length;
  
  const dueTodayCount = mockPendingFollowUps.filter((p) => p.dueStatus === 'due_today').length;
  const warmLeadsCount = leads.filter((l) => l.stage === 'WARM').length;
  const overdueCount = mockPendingFollowUps.filter((p) => p.dueStatus === 'overdue').length;
  
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
        <div className="flex items-center px-2 py-1">
          {apiStatus === 'connected' && (
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected: loaded from backend
            </span>
          )}
          {apiStatus === 'offline' && (
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Offline: using demo data
            </span>
          )}
          {apiStatus === 'empty' && (
            <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Empty backend: showing demo data
            </span>
          )}
        </div>
      </div>

      {/* Active Tab Screen */}
      <div className="w-full">
        {activeTab === 'pipeline' && (
          <FollowUpPipelineBoard 
            leads={leads} 
            onLeadClick={(leadId) => setSelectedLeadId(leadId)} 
          />
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
          />
        )}
        {activeTab === 'templates' && !isLoading && (
          <TemplateCardGrid templates={templates} />
        )}
        {activeTab === 'approvals' && !isLoading && (
          <PendingFollowUpsPanel initialTasks={mockPendingFollowUps} />
        )}
      </div>

      {/* Lead Detail Drawer overlay */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
        onUpdateLead={handleUpdateLead}
      />
    </main>
  );
};
