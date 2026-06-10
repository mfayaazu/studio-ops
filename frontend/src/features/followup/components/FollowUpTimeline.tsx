import React, { useState } from 'react';
import type { FollowUpStep, MessageTemplate, FollowUpSequence, LeadPipelineStage, LeadPriority } from '../types';
import { 
  createFollowUpStep, 
  updateFollowUpStep, 
  deleteFollowUpStep,
  createFollowUpSequence,
  updateFollowUpSequence,
  deleteFollowUpSequence
} from '../api/followupApi';
import { 
  Check, 
  Clock, 
  ChevronRight,
  Plus,
  Sliders,
  X,
  AlertTriangle,
  Loader2,
  Trash2,
  Settings,
  Edit,
  Activity
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FollowUpTimelineProps {
  steps: FollowUpStep[];
  templates?: MessageTemplate[];
  sequenceName?: string;
  sequenceId?: string;
  userRole?: string;
  onRefresh?: () => void;
  // Sequence management additions
  sequences?: FollowUpSequence[];
  activeSequenceId?: string;
  onChangeSequence?: (id: string) => void;
}

export const FollowUpTimeline: React.FC<FollowUpTimelineProps> = ({ 
  steps = [], 
  templates = [],
  sequenceName: _sequenceName = 'Default 10-Day Follow-up Timeline',
  sequenceId,
  userRole = 'EMPLOYEE',
  onRefresh,
  sequences = [],
  activeSequenceId: _activeSequenceId,
  onChangeSequence
}) => {
  const isEditable = userRole === 'OWNER' || userRole === 'ADMIN';

  // Step Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<FollowUpStep | null>(null);

  // Step Form states
  const [stepOrder, setStepOrder] = useState('1');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [goal, setGoal] = useState('');
  const [active, setActive] = useState(true);
  
  // CRM Enhancements step fields
  const [stepName, setStepName] = useState('');
  const [triggerStage, setTriggerStage] = useState<LeadPipelineStage>('NEW_LEAD');
  const [delayValue, setDelayValue] = useState('1');
  const [delayUnit, setDelayUnit] = useState<string>('DAYS');
  const [defaultPriority, setDefaultPriority] = useState<LeadPriority>('NORMAL');
  const [urgencyThresholdHours, setUrgencyThresholdHours] = useState('24');

  // Step Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  // Sequence Modal states
  const [isSeqModalOpen, setIsSeqModalOpen] = useState(false);
  const [isEditingSeq, setIsEditingSeq] = useState(false);
  const [seqName, setSeqName] = useState('');
  const [seqDescription, setSeqDescription] = useState('');
  const [seqActive, setSeqActive] = useState(true);
  const [seqApplicableStage, setSeqApplicableStage] = useState<LeadPipelineStage>('NEW_LEAD');
  const [isSavingSeq, setIsSavingSeq] = useState(false);
  const [isDeletingSeq, setIsDeletingSeq] = useState(false);
  const [seqError, setSeqError] = useState<string | null>(null);



  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case 'QUOTE_SENT':
        return 'Initial Quotation Dispatch';
      case 'SOFT_FOLLOW_UP':
        return 'Soft Check-in Message';
      case 'VALUE_FOLLOW_UP':
        return 'Value Guide & Tips';
      case 'SCARCITY_FOLLOW_UP':
        return 'Urgency & Scarcity Warning';
      case 'FINAL_FOLLOW_UP':
        return 'Polite Final Closure';
      case 'CUSTOM':
        return 'Custom/Other';
      default:
        return type;
    }
  };

  const getStepTemplateLabel = (step: FollowUpStep) => {
    if (step.templateId) {
      const tmpl = templates.find(t => t.id === step.templateId);
      return tmpl ? `${tmpl.name} (${getTemplateTypeLabel(tmpl.templateType)})` : 'Custom Template';
    }
    return 'Template Step';
  };

  const openCreateDrawer = () => {
    if (!isEditable) return;
    setEditingStep(null);
    
    // Auto-calculate next stepOrder
    const maxOrder = steps.reduce((max, s) => s.stepOrder > max ? s.stepOrder : max, 0);
    setStepOrder((maxOrder + 1).toString());
    
    // Auto-calculate next delay value
    const maxDelay = steps.reduce((max, s) => s.delayValue > max ? s.delayValue : max, 0);
    setDelayValue((maxDelay + 3).toString());
    
    // Default to first active template
    const activeTemplates = templates.filter(t => t.active);
    setSelectedTemplateId(activeTemplates[0]?.id || '');
    
    setStepName('');
    setTriggerStage('NEW_LEAD');
    setDelayValue('1');
    setDelayUnit('DAYS');
    setDefaultPriority('NORMAL');
    setUrgencyThresholdHours('24');
    setGoal('');
    setActive(true);
    setDrawerError(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (step: FollowUpStep) => {
    if (!isEditable) return;
    setEditingStep(step);
    setStepOrder(step.stepOrder.toString());
    setSelectedTemplateId(step.templateId || '');
    setGoal(step.goal || '');
    setActive(step.active);
    
    // CRM enhancements
    setStepName(step.stepName || '');
    setTriggerStage(step.triggerStage || 'NEW_LEAD');
    setDelayValue((step.delayValue ?? step.delayDays ?? 1).toString());
    setDelayUnit(step.delayUnit || 'DAYS');
    setDefaultPriority(step.defaultPriority || 'NORMAL');
    setUrgencyThresholdHours((step.urgencyThresholdHours ?? 24).toString());

    setDrawerError(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingStep(null);
    setDrawerError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sequenceId) {
      setDrawerError('Missing sequence context.');
      return;
    }
    if (!selectedTemplateId) {
      setDrawerError('Please select a message template.');
      return;
    }

    const orderNum = parseInt(stepOrder, 10);
    const delayValNum = parseInt(delayValue, 10);
    const urgencyThresholdNum = parseInt(urgencyThresholdHours, 10);

    if (isNaN(orderNum) || orderNum <= 0) {
      setDrawerError('Step Order must be a positive integer.');
      return;
    }
    if (isNaN(delayValNum) || delayValNum < 0) {
      setDrawerError('Delay value must be 0 or greater.');
      return;
    }

    setIsSaving(true);
    setDrawerError(null);

    const payload = {
      sequenceId,
      stepOrder: orderNum,
      delayDays: delayUnit === 'DAYS' ? delayValNum : Math.ceil(delayValNum / 24),
      channel: 'WHATSAPP' as const,
      templateId: selectedTemplateId,
      goal: goal.trim(),
      active,
      stepName: stepName.trim() || undefined,
      triggerStage,
      delayValue: delayValNum,
      delayUnit,
      defaultPriority,
      urgencyThresholdHours: isNaN(urgencyThresholdNum) ? 24 : urgencyThresholdNum
    };

    try {
      if (editingStep) {
        await updateFollowUpStep(editingStep.id, {
          stepOrder: payload.stepOrder,
          delayDays: payload.delayDays,
          channel: payload.channel,
          templateId: payload.templateId,
          goal: payload.goal,
          active: payload.active,
          stepName: payload.stepName,
          triggerStage: payload.triggerStage,
          delayValue: payload.delayValue,
          delayUnit: payload.delayUnit,
          defaultPriority: payload.defaultPriority,
          urgencyThresholdHours: payload.urgencyThresholdHours
        });
      } else {
        await createFollowUpStep(payload);
      }
      if (onRefresh) onRefresh();
      closeDrawer();
    } catch (err: any) {
      console.error('Failed to save step:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save sequence step.';
      setDrawerError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingStep) return;
    if (!window.confirm(`Are you sure you want to delete this sequence step (Step ${editingStep.stepOrder})?`)) return;

    setIsDeleting(true);
    setDrawerError(null);

    try {
      await deleteFollowUpStep(editingStep.id);
      if (onRefresh) onRefresh();
      closeDrawer();
    } catch (err: any) {
      console.error('Failed to delete step:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete sequence step.';
      setDrawerError(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Sequence CRUD Operations
  const openCreateSeqModal = () => {
    setIsEditingSeq(false);
    setSeqName('');
    setSeqDescription('');
    setSeqActive(true);
    setSeqApplicableStage('NEW_LEAD');
    setSeqError(null);
    setIsSeqModalOpen(true);
  };

  const openEditSeqModal = () => {
    const activeSeq = sequences.find(s => s.id === sequenceId);
    if (!activeSeq) return;
    setIsEditingSeq(true);
    setSeqName(activeSeq.name);
    setSeqDescription(activeSeq.description || '');
    setSeqActive(activeSeq.active);
    setSeqApplicableStage(activeSeq.applicableStage || 'NEW_LEAD');
    setSeqError(null);
    setIsSeqModalOpen(true);
  };

  const handleSaveSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seqName.trim()) {
      setSeqError('Sequence name is required.');
      return;
    }
    setIsSavingSeq(true);
    setSeqError(null);
    try {
      if (isEditingSeq && sequenceId) {
        await updateFollowUpSequence(sequenceId, {
          name: seqName.trim(),
          description: seqDescription.trim() || undefined,
          active: seqActive,
          applicableStage: seqApplicableStage
        });
      } else {
        const created = await createFollowUpSequence({
          name: seqName.trim(),
          description: seqDescription.trim() || undefined,
          active: seqActive,
          applicableStage: seqApplicableStage
        });
        if (onChangeSequence) {
          onChangeSequence(created.id);
        }
      }
      if (onRefresh) onRefresh();
      setIsSeqModalOpen(false);
    } catch (err: any) {
      setSeqError(err.message || 'Failed to save sequence.');
    } finally {
      setIsSavingSeq(false);
    }
  };

  const handleDeleteSequence = async () => {
    if (!sequenceId) return;
    if (!window.confirm('Are you sure you want to delete this sequence? All its steps will also be deleted.')) return;
    setIsDeletingSeq(true);
    setSeqError(null);
    try {
      await deleteFollowUpSequence(sequenceId);
      if (onChangeSequence && sequences.length > 1) {
        const remaining = sequences.filter(s => s.id !== sequenceId);
        onChangeSequence(remaining[0].id);
      } else if (onChangeSequence) {
        onChangeSequence('');
      }
      if (onRefresh) onRefresh();
      setIsSeqModalOpen(false);
    } catch (err: any) {
      setSeqError(err.message || 'Failed to delete sequence.');
    } finally {
      setIsDeletingSeq(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1222]/30 border border-slate-800/60 rounded-2xl p-6 shadow-xl">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Sequence Timeline
            </h3>
            
            {/* Sequence Selector */}
            <select
              value={sequenceId || ''}
              onChange={(e) => onChangeSequence && onChangeSequence(e.target.value)}
              className="bg-[#070b14] border border-slate-800 text-slate-300 rounded-lg py-1 px-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
            >
              <option value="" disabled>Select Sequence...</option>
              {sequences.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.active ? '(Active)' : ''}
                </option>
              ))}
            </select>

            {isEditable && (
              <div className="flex items-center gap-1">
                <button
                  onClick={openEditSeqModal}
                  className="p-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
                  title="Configure Sequence Info"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={openCreateSeqModal}
                  className="p-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
                  title="Create New Sequence"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            {sequences.find(s => s.id === sequenceId)?.description || 'No description provided.'}
          </p>
          {sequences.find(s => s.id === sequenceId)?.applicableStage && (
            <div className="text-[10px] text-slate-400 font-mono">
              Applies to Stage: <span className="text-violet-400 font-bold">{sequences.find(s => s.id === sequenceId)?.applicableStage}</span>
            </div>
          )}
        </div>

        {isEditable && sequenceId && (
          <button
            onClick={openCreateDrawer}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-violet-500/10 cursor-pointer w-fit flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Step</span>
          </button>
        )}
      </div>

      {/* WhatsApp banner */}
      <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/15 rounded-xl p-4 flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
        <p className="text-xs text-slate-400 leading-normal">
          <strong className="text-slate-350">Beta communication policy:</strong> WhatsApp is the exclusive channel. All steps are forced to WHATSAPP and must bind to a WhatsApp template.
        </p>
      </div>

      {/* Timeline view */}
      {steps.length === 0 ? (
        <div className="text-center py-16 bg-[#0d1424]/20 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <Settings className="h-8 w-8 text-slate-650 mx-auto" />
          <h4 className="text-xs font-medium text-slate-350">No Sequence Steps Scheduled</h4>
          <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
            This sequence has no steps. Add a step to schedule follow-up triggers.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-6 right-6 h-0.5 bg-slate-800/40 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col bg-[#0f172a]/95 border rounded-2xl p-5 space-y-4 shadow-lg justify-between transition-all duration-300",
                  step.active 
                    ? 'border-slate-850 hover:border-violet-500/40 hover:shadow-violet-500/5' 
                    : 'border-slate-900 opacity-50'
                )}
              >
                <div className="space-y-3">
                  {/* Top Row: Day Offset */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg border border-violet-500/15">
                      Step {step.stepOrder} • {step.delayValue} {step.delayUnit}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="hidden lg:block h-4 w-4 text-slate-700" />
                    )}
                  </div>

                  {/* Step Name / Template label */}
                  <div className="space-y-1">
                    {step.stepName && (
                      <div className="text-[11px] font-extrabold text-slate-200 uppercase tracking-wide truncate">
                        {step.stepName}
                      </div>
                    )}
                    <h4 className="text-[10.5px] font-bold text-slate-350 line-clamp-2 leading-relaxed">
                      {getStepTemplateLabel(step)}
                    </h4>
                  </div>

                  <div className="flex flex-col gap-1 text-[10px] text-slate-400 border-t border-slate-900/60 pt-2 font-mono">
                    <div>Stage: <span className="text-violet-400 font-semibold">{step.triggerStage || 'N/A'}</span></div>
                    <div>Priority: <span className="text-slate-300 font-semibold">{step.defaultPriority || 'NORMAL'}</span></div>
                    {step.urgencyThresholdHours !== undefined && (
                      <div>Urgency: <span className="text-rose-400 font-semibold">{step.urgencyThresholdHours}h Limit</span></div>
                    )}
                  </div>

                  {/* Goal & Description */}
                  {step.goal && (
                    <p className="text-[11px] text-slate-450 leading-relaxed font-sans line-clamp-2 bg-[#060b13]/40 border border-slate-900/60 p-2 rounded-lg">
                      {step.goal}
                    </p>
                  )}
                </div>

                {/* Status and Edit */}
                <div className="flex items-center justify-between pt-3.5 border-t border-slate-900/60 text-[10px]">
                  <span className={`flex items-center gap-1 font-bold ${step.active ? 'text-emerald-400' : 'text-slate-550'}`}>
                    {step.active ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    <span>{step.active ? 'Active' : 'Inactive'}</span>
                  </span>
                  
                  {isEditable && (
                    <button
                      onClick={() => openEditDrawer(step)}
                      className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded-md cursor-pointer"
                    >
                      <Sliders className="h-3 w-3" />
                      <span>Configure</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit/Create Step Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="absolute inset-0 cursor-default" onClick={closeDrawer} />
          <div className="relative w-full max-w-lg bg-[#090f1e] border-l border-slate-800/80 shadow-2xl flex flex-col h-full animate-slide-in">
            {/* Header */}
            <div className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingStep ? `Configure Step ${editingStep.stepOrder}` : 'Add Sequence Step'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure delay, trigger stage, priority and urgency rules
                  </p>
                </div>
              </div>
              <button 
                onClick={closeDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Notifications */}
            {drawerError && (
              <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-start gap-2.5 text-xs text-red-200">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">{drawerError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 flex flex-col justify-between h-full">
              <div className="space-y-5">
                {/* Step Name */}
                <div className="space-y-1.5">
                  <label htmlFor="step-name-input" className="text-xs font-bold text-slate-355 block">Step Name *</label>
                  <input
                    id="step-name-input"
                    type="text"
                    value={stepName}
                    onChange={(e) => setStepName(e.target.value)}
                    placeholder="e.g. Intro check-in, Scarcity notification"
                    className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Step Order */}
                  <div className="space-y-1.5">
                    <label htmlFor="step-order" className="text-xs font-bold text-slate-350 block">Step Order *</label>
                    <input
                      id="step-order"
                      type="number"
                      min="1"
                      value={stepOrder}
                      onChange={(e) => setStepOrder(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>

                  {/* Trigger Stage */}
                  <div className="space-y-1.5">
                    <label htmlFor="trigger-stage" className="text-xs font-bold text-slate-350 block">Trigger Stage *</label>
                    <select
                      id="trigger-stage"
                      value={triggerStage}
                      onChange={(e) => setTriggerStage(e.target.value as LeadPipelineStage)}
                      className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                      required
                    >
                      <option value="NEW_LEAD">New Inquiry</option>
                      <option value="QUOTE_SENT">Quote Sent</option>
                      <option value="WARM">Warm Lead</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="FOLLOW_UP_PENDING">Follow-up Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="LOST">Lost</option>
                    </select>
                  </div>
                </div>

                {/* Delay configuration */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Delay Value */}
                  <div className="space-y-1.5">
                    <label htmlFor="delay-val" className="text-xs font-bold text-slate-355 block">Delay Value *</label>
                    <input
                      id="delay-val"
                      type="number"
                      min="1"
                      value={delayValue}
                      onChange={(e) => setDelayValue(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>

                  {/* Delay Unit */}
                  <div className="space-y-1.5">
                    <label htmlFor="delay-unit" className="text-xs font-bold text-slate-355 block">Delay Unit *</label>
                    <select
                      id="delay-unit"
                      value={delayUnit}
                      onChange={(e) => setDelayUnit(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                      required
                    >
                      <option value="MINUTES">Minutes</option>
                      <option value="HOURS">Hours</option>
                      <option value="DAYS">Days</option>
                    </select>
                  </div>
                </div>

                {/* Priorities and Urgency */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Default Priority */}
                  <div className="space-y-1.5">
                    <label htmlFor="def-priority" className="text-xs font-bold text-slate-355 block">Default Priority *</label>
                    <select
                      id="def-priority"
                      value={defaultPriority}
                      onChange={(e) => setDefaultPriority(e.target.value as LeadPriority)}
                      className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                      required
                    >
                      <option value="LOW">LOW</option>
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>

                  {/* Urgency Threshold (Hours) */}
                  <div className="space-y-1.5">
                    <label htmlFor="urgency-hours" className="text-xs font-bold text-slate-355 block">Urgency Threshold (Hours) *</label>
                    <input
                      id="urgency-hours"
                      type="number"
                      min="1"
                      value={urgencyThresholdHours}
                      onChange={(e) => setUrgencyThresholdHours(e.target.value)}
                      placeholder="e.g. 24"
                      className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Template Selection */}
                <div className="space-y-1.5">
                  <label htmlFor="template-select" className="text-xs font-bold text-slate-350 block">Message Template *</label>
                  {templates.filter(t => t.active).length === 0 ? (
                    <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl text-xs text-red-400">
                      No active WhatsApp templates found. Please configure a template first.
                    </div>
                  ) : (
                    <select
                      id="template-select"
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select a template...</option>
                      {templates.filter(t => t.active).map((tmpl) => (
                        <option key={tmpl.id} value={tmpl.id}>
                          {tmpl.name} ({getTemplateTypeLabel(tmpl.templateType)})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Step Goal */}
                <div className="space-y-1.5">
                  <label htmlFor="step-goal" className="text-xs font-bold text-slate-350 block">Step Goal / Objective</label>
                  <input
                    id="step-goal"
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Introduce pricing structure"
                    className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Active Toggle Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-350 block">Status</label>
                  <div 
                    onClick={() => setActive(!active)}
                    className="flex items-center justify-between bg-[#070b14] border border-slate-800/80 rounded-xl px-4 py-2.5 cursor-pointer select-none hover:border-slate-700/60 transition-colors"
                  >
                    <span className="text-xs text-slate-355 font-medium">
                      {active ? 'Enabled / Active' : 'Disabled / Inactive'}
                    </span>
                    <div className={cn(
                      "w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200",
                      active ? "bg-emerald-500" : "bg-slate-700"
                    )}>
                      <div className={cn(
                        "w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm",
                        active ? "translate-x-3.5" : "translate-x-0"
                      )} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Actions Footer */}
              <div className="pt-6 border-t border-slate-850 flex justify-between items-center gap-3">
                <div>
                  {editingStep && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting || isSaving}
                      className="inline-flex items-center gap-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 hover:border-rose-500/20 text-rose-400 text-xs font-semibold py-2 px-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                    >
                      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    disabled={isSaving || isDeleting}
                    className="bg-slate-900 border border-slate-855 hover:bg-slate-800 text-slate-350 text-xs font-semibold py-2 px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isDeleting || templates.filter(t => t.active).length === 0}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2 px-4.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>Save Step</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sequence Edit/Create Modal Overlay */}
      {isSeqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#090f1e] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-400" />
                <span>{isEditingSeq ? 'Edit Sequence Info' : 'New Follow-up Sequence'}</span>
              </h3>
              <button
                onClick={() => setIsSeqModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error banner */}
            {seqError && (
              <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-start gap-2.5 text-xs text-red-200">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p>{seqError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveSequence} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="seq-name" className="text-xs font-bold text-slate-350 block">Sequence Name *</label>
                <input
                  id="seq-name"
                  type="text"
                  value={seqName}
                  onChange={(e) => setSeqName(e.target.value)}
                  placeholder="e.g. High Budget Lead Sequence"
                  className="w-full bg-[#070b14] border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="seq-description" className="text-xs font-bold text-slate-350 block">Description</label>
                <textarea
                  id="seq-description"
                  value={seqDescription}
                  onChange={(e) => setSeqDescription(e.target.value)}
                  placeholder="Explain the purpose of this sequence..."
                  className="w-full bg-[#070b14] border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-2 text-xs text-white outline-none h-20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="seq-stage" className="text-xs font-bold text-slate-350 block">Applicable Lead Stage *</label>
                <select
                  id="seq-stage"
                  value={seqApplicableStage}
                  onChange={(e) => setSeqApplicableStage(e.target.value as LeadPipelineStage)}
                  className="w-full bg-[#070b14] border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  required
                >
                  <option value="NEW_LEAD">New Inquiry</option>
                  <option value="QUOTE_SENT">Quote Sent</option>
                  <option value="WARM">Warm Lead</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="FOLLOW_UP_PENDING">Follow-up Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div className="flex items-center justify-between bg-[#070b14] border border-slate-850 rounded-xl p-3">
                <span className="text-xs text-slate-300 font-medium">Is Active</span>
                <div 
                  onClick={() => setSeqActive(!seqActive)}
                  className={cn(
                    "w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer select-none",
                    seqActive ? "bg-emerald-500" : "bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm",
                    seqActive ? "translate-x-3.5" : "translate-x-0"
                  )} />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center gap-3">
                <div>
                  {isEditingSeq && (
                    <button
                      type="button"
                      onClick={handleDeleteSequence}
                      disabled={isSavingSeq || isDeletingSeq}
                      className="inline-flex items-center gap-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 hover:border-rose-500/20 text-rose-400 text-xs font-semibold py-2 px-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      {isDeletingSeq ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      <span>Delete Sequence</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSeqModalOpen(false)}
                    disabled={isSavingSeq || isDeletingSeq}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2 px-4 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSeq || isDeletingSeq}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2 px-4.5 rounded-xl transition-all shadow-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSavingSeq ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>Save Sequence</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
