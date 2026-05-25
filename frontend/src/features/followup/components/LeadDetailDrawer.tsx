import React, { useState } from 'react';
import type { Lead, LeadStage, MessageTemplate, ChannelType, LeadPipelineStage, LeadLostReason } from '../types';
import { mockTemplates } from '../mockData';
import { 
  X, Mail, MessageSquare, Phone, Smartphone, Calendar, 
  DollarSign, Clock, CheckCircle2, 
  ChevronRight, ThumbsUp, Eye, Sparkles, Ban, Loader2,
  FolderPlus, AlertCircle
} from 'lucide-react';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onMoveStage: (
    stage: LeadPipelineStage,
    lostReason?: LeadLostReason,
    notes?: string
  ) => Promise<void>;
  onConvertToProject?: (leadId: string) => Promise<void>;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ 
  lead, 
  isOpen, 
  onClose,
  onUpdateLead,
  onMoveStage,
  onConvertToProject
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmingConvert, setIsConfirmingConvert] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Reset confirmation state when drawer lead changes or drawer closes
  React.useEffect(() => {
    setIsConfirmingConvert(false);
    setIsConverting(false);
  }, [lead?.id, isOpen]);

  if (!lead || !isOpen) return null;

  const FUNNEL_STAGES: LeadStage[] = [
    'NEW_LEAD',
    'QUOTE_SENT',
    'WARM',
    'NEGOTIATION',
    'FOLLOW_UP_PENDING',
    'CONFIRMED',
    'LOST'
  ];

  const getStageLabel = (stage: LeadStage) => {
    switch (stage) {
      case 'NEW_LEAD': return 'New Inquiry';
      case 'QUOTE_SENT': return 'Quote Sent';
      case 'WARM': return 'Warm Lead';
      case 'NEGOTIATION': return 'Negotiation';
      case 'FOLLOW_UP_PENDING': return 'Follow-up Pending';
      case 'CONFIRMED': return 'Confirmed (Won)';
      case 'LOST': return 'Lost';
      default: return stage;
    }
  };

  const getChannelIcon = (channel: ChannelType) => {
    switch (channel) {
      case 'EMAIL': return <Mail className="h-4 w-4" />;
      case 'WHATSAPP': return <MessageSquare className="h-4 w-4" />;
      case 'SMS': return <Smartphone className="h-4 w-4" />;
      case 'MANUAL_CALL': return <Phone className="h-4 w-4" />;
    }
  };

  // Determine next stage
  const currentStageIndex = FUNNEL_STAGES.indexOf(lead.stage);
  const isTerminal = lead.stage === 'CONFIRMED' || lead.stage === 'LOST';
  
  // Suggested template logic based on lead's current stage
  const getSuggestedTemplate = (): MessageTemplate | null => {
    let targetType = '';
    if (lead.stage === 'NEW_LEAD') targetType = 'QUOTE_SENT';
    else if (lead.stage === 'QUOTE_SENT') targetType = 'SOFT_FOLLOW_UP';
    else if (lead.stage === 'WARM') targetType = 'VALUE_FOLLOW_UP';
    else if (lead.stage === 'NEGOTIATION') targetType = 'SCARCITY_FOLLOW_UP';
    else if (lead.stage === 'FOLLOW_UP_PENDING') targetType = 'FINAL_FOLLOW_UP';
    
    if (!targetType) return null;
    
    return mockTemplates.find(
      t => t.templateType === targetType && t.channel === lead.channel
    ) || mockTemplates.find(t => t.templateType === targetType) || null;
  };

  const template = getSuggestedTemplate();

  // Render body text replacing tags
  const renderTemplateBody = (bodyText: string) => {
    return bodyText
      .replace(/\{\{clientName\}\}/g, lead.clientName)
      .replace(/\{\{projectTitle\}\}/g, lead.projectTitle)
      .replace(/\{\{estimatedValue\}\}/g, lead.estimatedValue.toLocaleString())
      .replace(/\{\{eventDate\}\}/g, lead.eventDate)
      .replace(/\{\{portfolioUrl\}\}/g, 'studioops.photo/portfolio/wedding')
      .replace(/\{\{guideUrl\}\}/g, 'studioops.photo/guides/wedding-tips');
  };

  // Handlers for stage movement
  const handleMoveToNextStage = async () => {
    if (isTerminal || lead.stage === 'FOLLOW_UP_PENDING') return;
    const nextStage = FUNNEL_STAGES[currentStageIndex + 1];
    setErrorMessage(null);
    setIsSaving(true);
    try {
      await onMoveStage(nextStage as LeadPipelineStage, undefined, lead.notes);
      setSimulationLog(`Successfully progressed lead to: ${getStageLabel(nextStage)}`);
      setIsPreviewOpen(false);
    } catch (err: any) {
      console.error('Failed to move stage:', err);
      setErrorMessage(err?.message || 'Failed to update pipeline stage. Please check connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkTerminal = async (targetTerminal: 'CONFIRMED' | 'LOST') => {
    setErrorMessage(null);
    setIsSaving(true);
    try {
      await onMoveStage(
        targetTerminal as LeadPipelineStage,
        targetTerminal === 'LOST' ? 'OTHER' : undefined,
        lead.notes
      );
      setSimulationLog(`Lead marked as ${targetTerminal === 'CONFIRMED' ? 'Confirmed (Won) 🎉' : 'Lost ✗'}`);
      setIsPreviewOpen(false);
    } catch (err: any) {
      console.error('Failed to update stage:', err);
      setErrorMessage(err?.message || `Failed to mark lead as ${targetTerminal.toLowerCase()}.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handlers for visual-only follow-up buttons
  const handleApproveFollowUp = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const messageLabel = template ? `Sent ${template.name}` : `Follow-up approved via ${lead.channel}`;
    
    const newHistory = [
      ...(lead.history || []),
      { date: todayStr, event: messageLabel, status: 'sent' as const }
    ];

    onUpdateLead({
      ...lead,
      lastContacted: todayStr,
      history: newHistory
    });

    setSimulationLog(`✓ Visual Simulation: Outbox dispatch successful for ${lead.clientName}!`);
    setIsPreviewOpen(false);
  };

  const handleSkipFollowUp = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newHistory = [
      ...(lead.history || []),
      { date: todayStr, event: `Skipped follow-up step (${lead.stage})`, status: 'skipped' as const }
    ];

    onUpdateLead({
      ...lead,
      history: newHistory
    });

    setSimulationLog(`✗ Visual Simulation: Follow-up step skipped.`);
    setIsPreviewOpen(false);
  };

  const handleConvertToProject = async () => {
    if (!lead || !onConvertToProject) return;
    setErrorMessage(null);
    setIsConverting(true);
    try {
      await onConvertToProject(lead.id);
      setSimulationLog(`Successfully converted lead to project!`);
      setIsConfirmingConvert(false);
    } catch (err: any) {
      console.error('Failed to convert lead to project:', err);
      setErrorMessage(err?.message || 'Failed to convert lead to project. Please check network connection.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-lg bg-[#0a0f1d] border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
              Lead Details Drawer
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{lead.clientName}</h3>
          </div>
          <div className="flex items-center gap-2">
            {lead.isBackendLead ? (
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-bold font-mono">
                DATABASE
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-bold font-mono">
                DEMO MOCK
              </span>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Simulation Alerts */}
          {simulationLog && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between gap-2 text-indigo-300 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0 animate-bounce" />
                <span>{simulationLog}</span>
              </div>
              <button 
                onClick={() => setSimulationLog(null)} 
                className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-2 text-rose-300 text-xs font-mono">
              <span>{errorMessage}</span>
              <button 
                onClick={() => setErrorMessage(null)} 
                className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Core Info Grid */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Lead Info</span>
            <div className="grid grid-cols-2 gap-4 bg-slate-900/20 border border-slate-850 p-4 rounded-xl">
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Event Type</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block truncate">{lead.projectTitle}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Est. Deal Value</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 block flex items-center">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>{lead.estimatedValue.toLocaleString()}</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Event Date</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>{lead.eventDate || 'N/A'}</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">City</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block">{lead.city || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Contact Info</span>
            <div className="grid grid-cols-2 gap-4 bg-slate-900/20 border border-slate-850 p-4 rounded-xl">
              <div className="col-span-2">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Client Name</span>
                <span className="text-xs font-bold text-slate-205 mt-1 block">{lead.clientName}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Phone</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{lead.phone || 'N/A'}</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Email</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block flex items-center gap-1 truncate">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span className="truncate">{lead.email || 'N/A'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline Details */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Pipeline status</span>
            <div className="grid grid-cols-2 gap-4 bg-slate-900/20 border border-slate-850 p-4 rounded-xl">
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Current Stage</span>
                <span className="text-xs font-bold text-violet-400 mt-1 block">{getStageLabel(lead.stage)}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Channel Preference</span>
                <span className="text-xs font-semibold text-slate-350 mt-1 block flex items-center gap-1">
                  <span className="text-slate-500">{getChannelIcon(lead.channel)}</span>
                  <span>{lead.channel}</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Lead Source</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block uppercase font-mono">{lead.leadSource || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Last Contacted</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block">{lead.lastContacted || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Next Follow-up</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block">{lead.nextFollowUp || 'N/A'}</span>
              </div>
              {lead.stage === 'LOST' && (
                <div>
                  <span className="text-[9px] font-mono uppercase text-rose-500 block">Lost Reason</span>
                  <span className="text-xs font-bold text-rose-400 mt-1 block uppercase font-mono">{lead.lostReason || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes Card */}
          {lead.notes && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Internal Lead Notes</span>
              <div className="bg-[#0f172a]/40 border border-slate-850/60 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed font-sans">
                {lead.notes}
              </div>
            </div>
          )}

          {/* Project Conversion & Linkage Block */}
          {lead.isBackendLead ? (
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Project Conversion</span>
              
              {lead.projectId ? (
                // Already Converted Info Card
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Project Linked & Converted</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 mt-2 bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-xs">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-500 block">Project ID</span>
                      <span className="text-slate-300 font-mono select-all block truncate mt-0.5" title="Double click to select all">
                        {lead.projectId}
                      </span>
                    </div>
                    {lead.convertedAt && (
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-500 block">Converted At</span>
                        <span className="text-slate-400 block mt-0.5">
                          {new Date(lead.convertedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Not Converted: Show Convert Button/Flow
                <div className="bg-[#0f172a]/30 border border-slate-850/60 rounded-xl p-4 space-y-3">
                  {!isConfirmingConvert ? (
                    <button
                      type="button"
                      disabled={isConverting || isSaving}
                      onClick={() => setIsConfirmingConvert(true)}
                      className="w-full py-2.5 px-4 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-violet-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <FolderPlus className="h-4 w-4 text-violet-400" />
                      <span>Convert to Project</span>
                    </button>
                  ) : (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex gap-2 items-start text-slate-400 text-xs leading-relaxed">
                        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p>Convert this lead into a client and project? This will register them in database and transition the stage.</p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          disabled={isConverting}
                          onClick={() => setIsConfirmingConvert(false)}
                          className="py-1.5 px-3 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-400 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isConverting}
                          onClick={handleConvertToProject}
                          className="py-1.5 px-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          {isConverting ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Converting...</span>
                            </>
                          ) : (
                            <span>Confirm Conversion</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Mock Lead Info Card
            <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-500 font-semibold block">
                Backend database lead required to convert to project
              </span>
            </div>
          )}

          {/* Workflow Stage Actions Row */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Stage Movement Actions</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={isTerminal || lead.stage === 'FOLLOW_UP_PENDING' || isSaving}
                onClick={handleMoveToNextStage}
                className="py-2.5 px-3 bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/20 disabled:opacity-40 disabled:hover:bg-violet-600/15 text-violet-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                title="Progress to next funnel stage"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                <span>Next Stage</span>
              </button>
              <button
                disabled={lead.stage === 'CONFIRMED' || isSaving}
                onClick={() => handleMarkTerminal('CONFIRMED')}
                className="py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 disabled:opacity-40 text-emerald-400 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Mark Won</span>
              </button>
              <button
                disabled={lead.stage === 'LOST' || isSaving}
                onClick={() => handleMarkTerminal('LOST')}
                className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-40 text-rose-400 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-4 w-4" />}
                <span>Mark Lost</span>
              </button>
            </div>
          </div>

          {/* Follow-up Suggested Message Alert Block */}
          {!isTerminal && template && (
            <div className="border border-slate-850/80 rounded-xl p-4 bg-slate-900/10 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wide flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Suggested Next Message ({template.templateType})</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">{lead.nextFollowUp}</span>
              </div>

              {/* Message Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{isPreviewOpen ? 'Hide Draft' : 'Preview Draft'}</span>
                </button>
                <button
                  onClick={handleApproveFollowUp}
                  className="flex-1 py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Approve & Send</span>
                </button>
                <button
                  onClick={handleSkipFollowUp}
                  className="py-2 px-3 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-slate-400 rounded-lg text-xs font-semibold transition-colors"
                  title="Skip this step"
                >
                  Skip
                </button>
              </div>

              {/* Inline Preview Content */}
              {isPreviewOpen && (
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg space-y-2 animate-fadeIn">
                  {template.subject && (
                    <div className="text-xs">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Subject:</span>
                      <p className="text-slate-300 font-medium">{template.subject}</p>
                    </div>
                  )}
                  <div className="text-xs">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Body Preview:</span>
                    <p className="text-slate-400 font-sans whitespace-pre-wrap leading-relaxed bg-[#0d1222]/30 p-2 rounded border border-slate-900 mt-1">
                      {renderTemplateBody(template.body)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audit History Log */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Communication & Audit History</span>
            <div className="space-y-2.5">
              {lead.history && lead.history.length > 0 ? (
                lead.history.map((log, idx) => (
                  <div key={idx} className="flex gap-3 text-[11px] items-start">
                    <span className="text-slate-500 font-mono whitespace-nowrap mt-0.5">{log.date}</span>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-slate-300 font-medium">{log.event}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-wider font-mono ${
                        log.status === 'sent' ? 'text-emerald-400' :
                        log.status === 'skipped' ? 'text-rose-400' :
                        'text-slate-500'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 border border-dashed border-slate-900 rounded-xl">
                  <span className="text-[10px] text-slate-600 font-semibold tracking-wide">No history log recorded</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </>
  );
};
