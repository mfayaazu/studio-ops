import React, { useState } from 'react';
import { mockLeads, mockSequenceSteps, mockTemplates, mockPendingFollowUps } from '../mockData';
import { FollowUpSummaryCards } from '../components/FollowUpSummaryCards';
import { FollowUpPipelineBoard } from '../components/FollowUpPipelineBoard';
import { FollowUpTimeline } from '../components/FollowUpTimeline';
import { TemplateCardGrid } from '../components/TemplateCardGrid';
import { PendingFollowUpsPanel } from '../components/PendingFollowUpsPanel';
import { Sparkles, MessageSquare, Compass, LayoutGrid } from 'lucide-react';

export const FollowUpCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'sequence' | 'templates'>('pipeline');

  // Calculate stats dynamically from mock data
  const openLeads = mockLeads.filter((l) => l.stage !== 'CONFIRMED' && l.stage !== 'LOST');
  const leadsInFunnel = openLeads.length;
  
  const dueTodayCount = mockPendingFollowUps.filter((p) => p.dueStatus === 'due_today').length;
  const warmLeadsCount = mockLeads.filter((l) => l.stage === 'WARM').length;
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

      {/* Main Split Grid: Left Side active tab, Right Side manual approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Tabs Switcher and Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation buttons */}
          <div className="flex border-b border-slate-800/80 gap-2">
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
          </div>

          {/* Active Tab Screen */}
          <div>
            {activeTab === 'pipeline' && <FollowUpPipelineBoard leads={mockLeads} />}
            {activeTab === 'sequence' && <FollowUpTimeline steps={mockSequenceSteps} />}
            {activeTab === 'templates' && <TemplateCardGrid templates={mockTemplates} />}
          </div>
        </div>

        {/* Right Side: Manual Approvals Gate Panel */}
        <div className="lg:col-span-1">
          <PendingFollowUpsPanel initialTasks={mockPendingFollowUps} />
        </div>
      </div>
    </main>
  );
};
