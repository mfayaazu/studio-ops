import React, { useState } from 'react';
import type { Lead, LeadStage, MessageTemplate, ChannelType, LeadPipelineStage, LeadLostReason, LeadPriority, LeadPaymentStatus, LeadPreferredChannel, FollowUpTask } from '../types';
import { formatCurrencyINR } from '../../../lib/formatters';
import { 
  X, Mail, MessageSquare, Phone, Smartphone, Calendar, 
  Clock, CheckCircle2, 
  ThumbsUp, Sparkles, Loader2,
  FolderPlus, AlertCircle, Plus
} from 'lucide-react';
import type { Quotation } from '../../quotations/types';
import { QuotationStatusBadge } from '../../quotations/components/QuotationStatusBadge';
import { updateLead, updateFollowUpTask, approveFollowUpTask, skipFollowUpTask, createFollowUpTask } from '../api/followupApi';

const mapChannelToPreferred = (channel: ChannelType): LeadPreferredChannel => {
  if (channel === 'WHATSAPP') return 'WHATSAPP';
  if (channel === 'EMAIL') return 'EMAIL';
  if (channel === 'SMS') return 'SMS';
  return 'PHONE_CALL';
};


const cleanPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '';
  return phone.trim().replace(/[\s\-\(\)]/g, '');
};

const isValidPhoneNumber = (phone: string | undefined): boolean => {
  const cleaned = cleanPhoneNumber(phone);
  return /^\+[1-9]\d{7,14}$/.test(cleaned);
};

interface LeadDetailDrawerProps {
  lead: Lead | null;
  task?: FollowUpTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onMoveStage: (
    stage: LeadPipelineStage,
    lostReason?: LeadLostReason,
    notes?: string
  ) => Promise<void>;
  onConvertToProject?: (leadId: string) => Promise<string>;
  quotations?: Quotation[];
  onCreateQuotation?: (lead: Lead) => void;
  onEditQuotation?: (qtn: Quotation) => void;
  templates?: MessageTemplate[];
  onActionSuccess?: () => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ 
  lead, 
  task,
  isOpen, 
  onClose,
  onUpdateLead,
  onMoveStage,
  onConvertToProject,
  quotations = [],
  onCreateQuotation,
  onEditQuotation,
  templates = [],
  onActionSuccess
}) => {
  const [simulationLog, setSimulationLog] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmingConvert, setIsConfirmingConvert] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // CRM Enhancements States
  const [priority, setPriority] = useState<LeadPriority>('NORMAL');
  const [quotationTotal, setQuotationTotal] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<LeadPaymentStatus>('UNPAID');
  const [selectedStage, setSelectedStage] = useState<LeadPipelineStage>('NEW_LEAD');
  const [backwardNotes, setBackwardNotes] = useState('');
  const [showBackwardNotes, setShowBackwardNotes] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  const [draftText, setDraftText] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [localTask, setLocalTask] = useState<FollowUpTask | null>(null);

  // Sync task prop with localTask state
  React.useEffect(() => {
    setLocalTask(task || null);
  }, [task?.id, lead?.id, isOpen]);

  const activeTask = localTask || task || null;

  // Reset confirmation and sync lead state when drawer lead changes or drawer closes
  React.useEffect(() => {
    setIsConfirmingConvert(false);
    setIsConverting(false);
    if (lead) {
      setPriority(lead.priority || 'NORMAL');
      setQuotationTotal(lead.quotationTotal || 0);
      setAmountPaid(lead.amountPaid || 0);
      setPaymentStatus(lead.paymentStatus || 'UNPAID');
      setSelectedStage(lead.stage as LeadPipelineStage);
      setBackwardNotes('');
      setShowBackwardNotes(false);
    }
  }, [lead?.id, isOpen]);

  // Suggested template logic based on lead's current stage
  const getSuggestedTemplate = (): MessageTemplate | null => {
    if (!lead) return null;
    let targetType = '';
    if (lead.stage === 'NEW_LEAD') targetType = 'QUOTE_SENT';
    else if (lead.stage === 'QUOTE_SENT') targetType = 'SOFT_FOLLOW_UP';
    else if (lead.stage === 'WARM') targetType = 'VALUE_FOLLOW_UP';
    else if (lead.stage === 'NEGOTIATION') targetType = 'SCARCITY_FOLLOW_UP';
    else if (lead.stage === 'FOLLOW_UP_PENDING') targetType = 'FINAL_FOLLOW_UP';
    
    if (!targetType) return null;
    
    return templates.find(
      t => t.templateType === targetType && t.channel === lead.channel
    ) || templates.find(t => t.templateType === targetType) || null;
  };

  const template = getSuggestedTemplate();

  // Render body text replacing tags
  const renderTemplateBody = (bodyText: string) => {
    if (!lead) return bodyText;
    return bodyText
      .replace(/\{\{clientName\}\}/g, lead.clientName || '')
      .replace(/\{\{projectTitle\}\}/g, lead.projectTitle || '')
      .replace(/\$\{\{estimatedValue\}\}/g, formatCurrencyINR(lead.estimatedValue || 0))
      .replace(/\{\{estimatedValue\}\}/g, formatCurrencyINR(lead.estimatedValue || 0))
      .replace(/\{\{eventDate\}\}/g, lead.eventDate || '')
      .replace(/\{\{portfolioUrl\}\}/g, 'studioops.photo/portfolio/wedding')
      .replace(/\{\{guideUrl\}\}/g, 'studioops.photo/guides/wedding-tips');
  };

  const templateMessage = template ? renderTemplateBody(template.body) : '';

  // Initialize draftText state using priority
  React.useEffect(() => {
    if (lead) {
      const initialText =
        activeTask?.draftMessage
        || (activeTask as any)?.finalMessage
        || (activeTask as any)?.messageBody
        || (activeTask as any)?.body
        || templateMessage
        || '';
      setDraftText(initialText);
    } else {
      setDraftText('');
    }
  }, [activeTask?.id, lead?.id, templateMessage]);

  const savedDraftOrBody =
    activeTask?.draftMessage?.trim()
    || (activeTask as any)?.finalMessage?.trim()
    || (activeTask as any)?.messageBody?.trim()
    || (activeTask as any)?.body?.trim()
    || templateMessage
    || '';

  const canUseTaskActions = Boolean(activeTask?.id);
  const hasUnsavedChanges = draftText !== savedDraftOrBody;
  const isButtonsDisabled = !draftText.trim();

  if (!lead || !isOpen) return null;

  const leadQuotations = quotations.filter((q) => q.leadId === lead.id);
  const hasAcceptedQuotation = leadQuotations.some((q) => q.status === 'ACCEPTED');

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

  const isTerminal = lead.stage === 'CONFIRMED' || lead.stage === 'LOST';
  
  // Handlers for follow-up buttons
  const handleSaveDraft = async () => {
    if (!lead) return;
    setIsSavingDraft(true);
    setErrorMessage(null);
    try {
      if (activeTask) {
        const updatedTask = await updateFollowUpTask(activeTask.id, {
          scheduledAt: activeTask.scheduledAt,
          recipient: activeTask.recipient || lead.phone,
          subject: activeTask.subject,
          messageBody: activeTask.messageBody,
          isDraft: true,
          draftMessage: draftText,
          priority: activeTask.priority || lead.priority || 'NORMAL'
        });
        setLocalTask(updatedTask);
        setSimulationLog('Draft saved');
        onActionSuccess?.();
      } else {
        const createdTask = await createFollowUpTask({
          leadId: lead.id,
          status: 'PENDING_APPROVAL',
          isDraft: true,
          draftMessage: draftText,
          messageBody: templateMessage || draftText,
          channel: 'WHATSAPP',
          scheduledAt: new Date().toISOString(),
          recipient: lead.phone,
          priority: lead.priority || 'NORMAL'
        });
        setLocalTask(createdTask);
        setSimulationLog('Draft saved');
        onActionSuccess?.();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Failed to save draft: ${err.message}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleApproveFollowUp = async () => {
    if (activeTask) {
      try {
        await updateFollowUpTask(activeTask.id, {
          scheduledAt: activeTask.scheduledAt,
          recipient: activeTask.recipient || lead?.phone,
          subject: activeTask.subject,
          messageBody: draftText,
          isDraft: false,
          draftMessage: draftText,
          priority: activeTask.priority || lead?.priority || 'NORMAL'
        });
        await approveFollowUpTask(activeTask.id);
      } catch (err: any) {
        console.error('Failed to approve follow-up task on backend:', err);
      }
    }

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
    onActionSuccess?.();
  };

  const handleSkipFollowUp = async () => {
    if (activeTask) {
      try {
        await skipFollowUpTask(activeTask.id);
      } catch (err: any) {
        console.error('Failed to skip task on backend:', err);
      }
    }

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
    onActionSuccess?.();
  };

  const handleOpenWhatsApp = async () => {
    if (!lead) return;
    const phoneClean = cleanPhoneNumber(lead.phone).replace(/^\+/, '');
    const encodedText = encodeURIComponent(draftText);
    const url = `https://wa.me/${phoneClean}?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    try {
      if (activeTask) {
        const updatedTask = await updateFollowUpTask(activeTask.id, {
          scheduledAt: activeTask.scheduledAt,
          recipient: activeTask.recipient || lead.phone,
          subject: activeTask.subject,
          messageBody: activeTask.messageBody,
          isDraft: true,
          draftMessage: draftText,
          priority: activeTask.priority || lead.priority || 'NORMAL'
        });
        setLocalTask(updatedTask);
        onActionSuccess?.();
      } else {
        const createdTask = await createFollowUpTask({
          leadId: lead.id,
          status: 'PENDING_APPROVAL',
          isDraft: true,
          draftMessage: draftText,
          messageBody: templateMessage || draftText,
          channel: 'WHATSAPP',
          scheduledAt: new Date().toISOString(),
          recipient: lead.phone,
          priority: lead.priority || 'NORMAL'
        });
        setLocalTask(createdTask);
        onActionSuccess?.();
      }
    } catch (err: any) {
      console.warn('Failed to auto-save draft before WhatsApp redirect:', err);
    }
  };

  const handleConvertToProject = async () => {
    if (!lead || !onConvertToProject) return;
    setErrorMessage(null);
    setIsConverting(true);
    try {
      const msg = await onConvertToProject(lead.id);
      setSimulationLog(msg || `Successfully converted lead to project!`);
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full md:max-w-4xl bg-[#090d1a] border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 font-mono">
              Lead Details
            </span>
            <h3 className="text-xl font-bold text-white mt-1 leading-snug">{lead.clientName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Simulation Alerts */}
          {simulationLog && (
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between gap-2 text-indigo-300 text-sm font-mono shadow-inner animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0 animate-pulse" />
                <span>{simulationLog}</span>
              </div>
              <button 
                onClick={() => setSimulationLog(null)} 
                className="text-xs text-slate-400 hover:text-slate-200 uppercase tracking-wider font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-2 text-rose-300 text-sm font-mono shadow-inner animate-fadeIn">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                {errorMessage}
              </span>
              <button 
                onClick={() => setErrorMessage(null)} 
                className="text-xs text-slate-400 hover:text-slate-200 uppercase tracking-wider font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Core Info Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider block border-l-2 border-indigo-500 pl-2">Lead Info</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-900/35 border border-slate-800/80 p-5 rounded-2xl">
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Event Type / Title</span>
                <span className="text-sm font-bold text-slate-100 mt-1 block truncate" title={lead.projectTitle}>{lead.projectTitle}</span>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Commercial Value</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block">
                  {formatCurrencyINR(lead.quotationTotal || lead.estimatedValue || 0)}
                </span>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Event Date</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span>{lead.eventDate || 'N/A'}</span>
                </span>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">City</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block">{lead.city || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider block border-l-2 border-indigo-500 pl-2">Contact Info</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-900/35 border border-slate-800/80 p-5 rounded-2xl">
              <div className="sm:col-span-2">
                <span className="text-xs font-mono uppercase text-slate-400 block">Client Name</span>
                <span className="text-sm font-bold text-slate-100 mt-1 block">{lead.clientName}</span>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Phone</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-indigo-400" />
                  <span className="font-mono">{lead.phone || 'N/A'}</span>
                </span>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Email</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block flex items-center gap-1.5 truncate">
                  <Mail className="h-4 w-4 text-indigo-400" />
                  <span className="truncate font-mono">{lead.email || 'N/A'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline Details */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider block border-l-2 border-indigo-500 pl-2">Pipeline status</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-900/35 border border-slate-800/80 p-5 rounded-2xl">
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Current Stage</span>
                <span className="text-sm font-bold text-violet-400 mt-1.5 block">{getStageLabel(lead.stage)}</span>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Lead Priority</span>
                <select
                  value={priority}
                  onChange={async (e) => {
                    const nextPriority = e.target.value as LeadPriority;
                    setPriority(nextPriority);
                    setErrorMessage(null);
                    try {
                      await updateLead(lead.id, {
                        clientName: lead.clientName,
                        preferredChannel: mapChannelToPreferred(lead.channel),
                        leadSource: lead.leadSource || 'WEBSITE',
                        priority: nextPriority,
                        quotationTotal: lead.quotationTotal,
                        amountPaid: lead.amountPaid,
                        paymentStatus: lead.paymentStatus,
                        eventSegments: lead.eventSegments
                      });
                      setSimulationLog(`Lead priority updated to ${nextPriority}`);
                      onUpdateLead({ ...lead, priority: nextPriority });
                    } catch (err: any) {
                      setErrorMessage(err?.message || 'Failed to update priority');
                    }
                  }}
                  className="w-full bg-[#111933] border border-slate-700/80 text-slate-200 rounded-lg py-2 px-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 mt-1.5 focus:outline-none transition-colors"
                >
                  <option value="LOW">LOW</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Channel Preference</span>
                <span className="text-sm font-semibold text-slate-200 mt-1.5 block flex items-center gap-1.5">
                  <span className="text-indigo-400">{getChannelIcon(lead.channel)}</span>
                  <span>{lead.channel}</span>
                </span>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Lead Source</span>
                <span className="text-sm font-semibold text-slate-200 mt-1.5 block uppercase font-mono">{lead.leadSource || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Last Contacted</span>
                <span className="text-sm font-semibold text-slate-200 mt-1.5 block font-mono">{lead.lastContacted || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Next Follow-up</span>
                <span className="text-sm font-semibold text-slate-200 mt-1.5 block font-mono">{lead.nextFollowUp || 'N/A'}</span>
              </div>
              {lead.stage === 'LOST' && (
                <div className="sm:col-span-2">
                  <span className="text-xs font-mono uppercase text-rose-400 block">Lost Reason</span>
                  <span className="text-sm font-bold text-rose-400 mt-1.5 block uppercase font-mono">{lead.lostReason || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes Card */}
          {lead.notes && (
            <div className="space-y-3">
              <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider block border-l-2 border-indigo-500 pl-2">Internal Lead Notes</span>
              <div className="bg-slate-900/35 border border-slate-800/80 p-5 rounded-2xl text-sm text-slate-200 leading-relaxed font-sans shadow-inner">
                {lead.notes}
              </div>
            </div>
          )}
          
          {/* Payments & Commercials Section */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider block border-l-2 border-indigo-500 pl-2">Payments & Commercials</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-900/35 border border-slate-800/80 p-5 rounded-2xl">
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block">Quotation Total (INR)</label>
                <input
                  type="number"
                  value={quotationTotal}
                  onChange={(e) => setQuotationTotal(Number(e.target.value))}
                  className="w-full bg-[#111933] border border-slate-700/80 text-slate-100 rounded-lg py-2 px-3 text-sm mt-1 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block">Amount Paid (INR)</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full bg-[#111933] border border-slate-700/80 text-slate-100 rounded-lg py-2 px-3 text-sm mt-1 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as LeadPaymentStatus)}
                  className="w-full bg-[#111933] border border-slate-700/80 text-slate-200 rounded-lg py-2 px-3 text-sm mt-1 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-colors"
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="ADVANCE_PAID">ADVANCE PAID</option>
                  <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                  <option value="PAID">PAID</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Amount Remaining</span>
                <span className="text-sm font-bold text-amber-400 mt-2.5 block font-mono">
                  {formatCurrencyINR(quotationTotal - amountPaid)}
                </span>
              </div>
              <div className="sm:col-span-2 flex justify-end pt-2 border-t border-slate-800/60 mt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setErrorMessage(null);
                    setIsSaving(true);
                    try {
                      await updateLead(lead.id, {
                        clientName: lead.clientName,
                        preferredChannel: mapChannelToPreferred(lead.channel),
                        leadSource: lead.leadSource || 'WEBSITE',
                        priority: lead.priority,
                        quotationTotal,
                        amountPaid,
                        paymentStatus,
                        eventSegments: lead.eventSegments
                      });
                      setSimulationLog('Lead payment details successfully updated!');
                      onUpdateLead({
                        ...lead,
                        quotationTotal,
                        amountPaid,
                        amountRemaining: quotationTotal - amountPaid,
                        paymentStatus
                      });
                    } catch (err: any) {
                      setErrorMessage(err?.message || 'Failed to update payment details');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md"
                >
                  Save Payments
                </button>
              </div>
            </div>
          </div>

          {/* Lead Event Segments List */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider block border-l-2 border-indigo-500 pl-2">Lead Event Segments ({lead.eventSegments?.length || 0})</span>
            <div className="space-y-3.5">
              {lead.eventSegments && lead.eventSegments.length > 0 ? (
                lead.eventSegments.map((seg, idx) => (
                  <div key={idx} className="bg-slate-900/35 border border-slate-800/80 p-4 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/50">
                      <span className="font-bold text-violet-400 font-mono text-xs uppercase">{seg.eventType} — {seg.eventName}</span>
                      {seg.eventDate && (
                        <span className="text-xs text-slate-300 font-mono font-semibold flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                          {seg.eventDate}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-200 text-xs">
                      {seg.startTime && (
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Timings</span>
                          <span className="font-semibold">{seg.startTime} {seg.endTime ? `to ${seg.endTime}` : ''}</span>
                        </div>
                      )}
                      {seg.city && (
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">City / Venue</span>
                          <span className="font-semibold">{seg.city} {seg.venueName ? `(${seg.venueName})` : ''}</span>
                        </div>
                      )}
                    </div>
                    {seg.notes && (
                      <p className="text-slate-400 text-xs italic pt-2 border-t border-slate-800/40 mt-1">Notes: {seg.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-slate-900/20 border border-slate-800/60 p-5 rounded-2xl text-center shadow-inner">
                  <span className="text-xs text-slate-500 font-semibold">No event segments found.</span>
                </div>
              )}
            </div>
          </div>

          {/* Quotations Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
              <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider block border-l-2 border-indigo-500 pl-2">Proposal Estimates</span>
              {onCreateQuotation && (
                <button
                  type="button"
                  onClick={() => onCreateQuotation(lead)}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5 cursor-pointer bg-violet-600/10 hover:bg-violet-600/20 px-3 py-1.5 rounded-lg border border-violet-500/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Quote</span>
                </button>
              )}
            </div>

            {leadQuotations.length === 0 ? (
              <div className="bg-slate-900/20 border border-slate-800/60 p-5 rounded-2xl text-center shadow-inner">
                <span className="text-xs text-slate-500 font-semibold">No quotation created yet for this lead.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {leadQuotations.map((qtn) => (
                  <div
                     key={qtn.id}
                     onClick={() => onEditQuotation && onEditQuotation(qtn)}
                     className="group bg-slate-900/35 hover:bg-[#121c33] border border-slate-800/80 hover:border-violet-500/30 rounded-2xl p-4.5 flex flex-col gap-3 transition-all duration-200 cursor-pointer relative"
                  >
                    <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-violet-600/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-violet-400 font-mono tracking-widest block uppercase">
                          {qtn.quotationNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-200 group-hover:text-white line-clamp-1">
                          {qtn.title}
                        </h4>
                      </div>
                      <QuotationStatusBadge status={qtn.status} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono border-t border-slate-800/50 pt-2.5 mt-1">
                      <span className="font-bold">{formatCurrencyINR(qtn.totalAmount)}</span>
                      {qtn.validUntil ? (
                        <span className="text-slate-400 font-semibold">Valid: {qtn.validUntil}</span>
                      ) : (
                        <span className="text-slate-500 italic">No validity date</span>
                      )}
                    </div>
                    {qtn.status === 'SENT' && (
                      <div className="text-[10px] text-amber-400/90 font-mono mt-1 border-t border-slate-800/40 pt-2 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <span>Follow-up automation trigger will be connected in AUTO-001.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Conversion & Linkage Block */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider block border-l-2 border-indigo-500 pl-2">Project Conversion</span>
            
            {lead.projectId ? (
              // Already Converted Info Card
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span>Project Linked & Converted</span>
                </div>
                <div className="grid grid-cols-1 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Project ID</span>
                    <span className="text-slate-300 font-mono select-all block truncate mt-1" title="Double click to select all">
                      {lead.projectId}
                    </span>
                  </div>
                  {lead.convertedAt && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Converted At</span>
                      <span className="text-slate-400 block mt-1">
                        {new Date(lead.convertedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Not Converted: Show Convert Button/Flow
              <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-inner">
                {hasAcceptedQuotation && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs flex items-center gap-2.5 mb-1 font-semibold">
                    <Sparkles className="h-4 w-4 text-emerald-400 flex-shrink-0 animate-pulse" />
                    <span>Accepted Quote Found! Ready to convert.</span>
                  </div>
                )}
                {!isConfirmingConvert ? (
                  <button
                    type="button"
                    disabled={isConverting || isSaving}
                    onClick={() => setIsConfirmingConvert(true)}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      hasAcceptedQuotation
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/20 text-white shadow-md'
                        : 'bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/30 text-violet-300'
                    }`}
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span>{hasAcceptedQuotation ? 'Create Project from Accepted Quote' : 'Convert to Project'}</span>
                  </button>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex gap-2.5 items-start text-slate-300 text-xs leading-relaxed bg-[#1b101c]/30 border border-amber-500/20 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p>Convert this lead into a client and project? This will register them in database and transition the stage.</p>
                    </div>
                    <div className="flex gap-2.5 justify-end">
                      <button
                        type="button"
                        disabled={isConverting}
                        onClick={() => setIsConfirmingConvert(false)}
                        className="py-2 px-4 bg-slate-800 hover:bg-slate-700/80 disabled:opacity-40 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isConverting}
                        onClick={handleConvertToProject}
                        className="py-2 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        {isConverting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
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

          {/* Bidirectional Stage movement action */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider block border-l-2 border-indigo-500 pl-2">Update Pipeline Stage</span>
            <div className="bg-slate-900/35 border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">Transition Stage</span>
                <select
                  value={selectedStage}
                  onChange={(e) => {
                    const targetStage = e.target.value as LeadPipelineStage;
                    setSelectedStage(targetStage);
                    
                    const oldIndex = FUNNEL_STAGES.indexOf(lead.stage);
                    const newIndex = FUNNEL_STAGES.indexOf(targetStage);
                    
                    if (newIndex < oldIndex) {
                      setShowBackwardNotes(true);
                    } else {
                      setShowBackwardNotes(false);
                    }
                  }}
                  className="w-full bg-[#111933] border border-slate-700/80 text-slate-200 rounded-lg py-2 px-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-colors"
                >
                  {FUNNEL_STAGES.map((stg) => (
                    <option key={stg} value={stg}>{getStageLabel(stg)}</option>
                  ))}
                </select>
              </div>

              {showBackwardNotes && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-mono uppercase text-rose-400 block">Notes / Reason for backward stage transition *</label>
                  <textarea
                    value={backwardNotes}
                    onChange={(e) => setBackwardNotes(e.target.value)}
                    placeholder="Enter the reason for moving the lead backward..."
                    rows={2}
                    className="w-full bg-[#111933] border border-rose-500/30 text-slate-100 rounded-lg p-3 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 focus:outline-none resize-none"
                  />
                </div>
              )}

              {selectedStage === 'LOST' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-mono uppercase text-slate-400 block">Lost Reason</label>
                  <select
                    className="w-full bg-[#111933] border border-slate-700/80 text-slate-200 rounded-lg py-2 px-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-colors"
                    id="lost-reason-select"
                  >
                    <option value="PRICE_TOO_HIGH">PRICE TOO HIGH</option>
                    <option value="BOOKED_COMPETITOR">BOOKED COMPETITOR</option>
                    <option value="DATE_UNAVAILABLE">DATE UNAVAILABLE</option>
                    <option value="NO_RESPONSE">NO RESPONSE</option>
                    <option value="CLIENT_CANCELLED">CLIENT CANCELLED</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-1.5 border-t border-slate-800/60">
                <button
                  type="button"
                  disabled={isUpdatingStage || (showBackwardNotes && !backwardNotes.trim())}
                  onClick={async () => {
                    setErrorMessage(null);
                    setIsUpdatingStage(true);
                    
                    const lostReasonEl = document.getElementById('lost-reason-select') as HTMLSelectElement | null;
                    const resolvedLostReason = selectedStage === 'LOST' ? (lostReasonEl?.value as LeadLostReason || 'OTHER') : undefined;
                    
                    try {
                      await onMoveStage(
                        selectedStage,
                        resolvedLostReason,
                        showBackwardNotes ? backwardNotes.trim() : lead.notes
                      );
                      setSimulationLog(`Successfully transitioned stage to: ${getStageLabel(selectedStage)}`);
                      setShowBackwardNotes(false);
                      setBackwardNotes('');
                    } catch (err: any) {
                      setErrorMessage(err?.message || 'Failed to transition stage');
                    } finally {
                      setIsUpdatingStage(false);
                    }
                  }}
                  className="py-2 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  {isUpdatingStage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Transition Stage</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Suggested Message Editor Block */}
          {!isTerminal && template && (
            <div className="border border-slate-800/80 rounded-2xl p-5 bg-slate-900/35 space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span>WhatsApp Draft Message ({template.templateType})</span>
                  </span>
                  {(activeTask?.isDraft || activeTask?.draftMessage) && (
                    <span className="px-2 py-[2px] bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded text-[9px] font-black tracking-wide uppercase shrink-0">
                      DRAFT SAVED
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-bold font-mono">{lead.nextFollowUp}</span>
              </div>

              {/* Textarea and buttons */}
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs font-medium flex flex-col space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Draft Message Text</span>
                    {hasUnsavedChanges && (
                      <span className="text-xs text-amber-400 font-semibold italic animate-pulse">Unsaved changes</span>
                    )}
                  </div>
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    className="w-full bg-[#111933] border border-slate-700/80 text-slate-100 rounded-lg p-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none resize-none min-h-[140px] font-sans leading-relaxed"
                    placeholder="Type message draft here..."
                  />
                  <div className="flex justify-between items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        // Reset draft
                        if (activeTask) {
                          setIsSavingDraft(true);
                          try {
                            const updatedTask = await updateFollowUpTask(activeTask.id, {
                              scheduledAt: activeTask.scheduledAt,
                              recipient: activeTask.recipient || lead.phone,
                              subject: activeTask.subject,
                              messageBody: activeTask.messageBody,
                              isDraft: false,
                              draftMessage: '',
                              priority: activeTask.priority || lead.priority || 'NORMAL'
                            });
                            setLocalTask(updatedTask);
                            setSimulationLog('Reset to template');
                            onActionSuccess?.();
                          } catch (err: any) {
                            console.error(err);
                            setErrorMessage(`Failed to reset template: ${err.message}`);
                          } finally {
                            setIsSavingDraft(false);
                          }
                        }
                        setDraftText(templateMessage);
                      }}
                      className="py-2 px-4 rounded-lg text-xs font-bold text-slate-300 hover:text-slate-100 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                    >
                      Reset to Template
                    </button>
                    <button
                      type="button"
                      disabled={isSavingDraft || isButtonsDisabled}
                      onClick={handleSaveDraft}
                      className={`py-2 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        !isButtonsDisabled
                          ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isSavingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                      <span>Save Draft</span>
                    </button>
                  </div>
                </div>

                {!canUseTaskActions && (
                  <div className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-500" />
                    <span>No follow-up task exists yet. Save Draft will create one.</span>
                  </div>
                )}

                {/* Bottom Action buttons */}
                <div className="flex gap-2.5 pt-3 border-t border-slate-800/60">
                  <button
                    onClick={handleSkipFollowUp}
                    disabled={!canUseTaskActions}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      canUseTaskActions
                        ? 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/50 cursor-pointer'
                        : 'bg-slate-850 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                    title={canUseTaskActions ? "Skip this step" : "No scheduled task linked to this lead"}
                  >
                    Skip
                  </button>

                  {lead.channel === 'WHATSAPP' ? (
                    <>
                      <button
                        disabled={!isValidPhoneNumber(lead.phone) || isButtonsDisabled}
                        onClick={handleOpenWhatsApp}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isValidPhoneNumber(lead.phone) && !isButtonsDisabled
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md'
                            : 'bg-slate-855 text-slate-500 cursor-not-allowed opacity-50'
                        }`}
                        title={isValidPhoneNumber(lead.phone) ? "Open WhatsApp" : "Valid WhatsApp number with country code required."}
                      >
                        <MessageSquare className="h-4 w-4 text-white" />
                        <span>Open WhatsApp</span>
                      </button>

                      <button
                        disabled={!isValidPhoneNumber(lead.phone) || isButtonsDisabled || !canUseTaskActions}
                        onClick={handleApproveFollowUp}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          isValidPhoneNumber(lead.phone) && !isButtonsDisabled && canUseTaskActions
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-md cursor-pointer'
                            : 'bg-slate-850 text-slate-550 cursor-not-allowed opacity-50'
                        }`}
                        title={
                          !canUseTaskActions 
                            ? "No scheduled task linked to this lead" 
                            : isValidPhoneNumber(lead.phone) 
                              ? "Mark as Sent" 
                              : "Valid WhatsApp number with country code required."
                        }
                      >
                        <ThumbsUp className="h-4 w-4 text-white" />
                        <span>Mark as Sent</span>
                      </button>
                    </>
                  ) : (
                    <button
                      disabled={isButtonsDisabled || !canUseTaskActions}
                      onClick={handleApproveFollowUp}
                      className={`flex-1 py-2.5 px-3 border rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        !isButtonsDisabled && canUseTaskActions
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 cursor-pointer shadow-md'
                          : 'bg-slate-855 text-slate-550 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4 text-emerald-400" />
                      <span>Approve & Send</span>
                    </button>
                  )}
                </div>

                {lead.channel === 'WHATSAPP' && (
                  <div className="space-y-2 mt-1">
                    {!isValidPhoneNumber(lead.phone) && (
                      <div className="text-xs text-rose-350 bg-rose-500/5 border border-rose-500/10 px-3 py-2 rounded-lg flex items-center gap-2 font-medium">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
                        <span>Valid WhatsApp number with country code required.</span>
                      </div>
                    )}
                    <div className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-lg flex items-center gap-2 font-medium">
                      <MessageSquare className="h-4 w-4 flex-shrink-0 text-emerald-400 animate-pulse" />
                      <span>Manual WhatsApp send — open WhatsApp first, then mark as sent.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit History Log */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider block border-l-2 border-indigo-500 pl-2">Communication & Audit History</span>
            <div className="space-y-4 pl-2">
              {lead.history && lead.history.length > 0 ? (
                lead.history.map((log, idx) => (
                  <div key={idx} className="flex gap-4 text-xs items-start border-l-2 border-slate-800/80 pl-4 pb-2 relative">
                    <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-700" />
                    <span className="text-slate-400 font-mono whitespace-nowrap mt-0.5 font-semibold">{log.date}</span>
                    <div className="flex-1 space-y-1">
                      <p className="text-slate-200 font-semibold">{log.event}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest font-mono border ${
                        log.status === 'sent' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        log.status === 'skipped' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                  <span className="text-xs text-slate-500 font-semibold tracking-wide">No history log recorded</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/40 flex justify-end gap-2.5">
          <button 
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700/50"
          >
            Close Details
          </button>
        </div>
      </div>
    </>
  );
};
