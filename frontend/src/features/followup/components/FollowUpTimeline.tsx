import React, { useState } from 'react';
import type { FollowUpStep, MessageTemplate } from '../types';
import { 
  createFollowUpStep, 
  updateFollowUpStep, 
  deleteFollowUpStep 
} from '../api/followupApi';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Smartphone, 
  Check, 
  Clock, 
  ChevronRight,
  Plus,
  Sliders,
  X,
  AlertTriangle,
  Loader2,
  Trash2,
  Settings
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FollowUpTimelineProps {
  steps: FollowUpStep[];
  templates?: MessageTemplate[];
  sequenceName?: string;
  sequenceId?: string;
  userRole?: string;
  onRefresh?: () => void;
}

export const FollowUpTimeline: React.FC<FollowUpTimelineProps> = ({ 
  steps = [], 
  templates = [],
  sequenceName = 'Default 10-Day Follow-up Timeline',
  sequenceId,
  userRole = 'EMPLOYEE',
  onRefresh
}) => {
  const isEditable = userRole === 'OWNER' || userRole === 'ADMIN';

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<FollowUpStep | null>(null);

  // Form states
  const [stepOrder, setStepOrder] = useState('1');
  const [delayDays, setDelayDays] = useState('1');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [goal, setGoal] = useState('');
  const [active, setActive] = useState(true);

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="h-3.5 w-3.5" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-3.5 w-3.5" />;
      case 'SMS':
        return <Smartphone className="h-3.5 w-3.5" />;
      case 'MANUAL_CALL':
        return <Phone className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

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
    
    // Auto-calculate next delay days
    const maxDelay = steps.reduce((max, s) => s.delayDays > max ? s.delayDays : max, 0);
    setDelayDays((maxDelay + 3).toString());
    
    // Default to first active template
    const activeTemplates = templates.filter(t => t.active);
    setSelectedTemplateId(activeTemplates[0]?.id || '');
    
    setGoal('');
    setActive(true);
    setDrawerError(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (step: FollowUpStep) => {
    if (!isEditable) return;
    setEditingStep(step);
    setStepOrder(step.stepOrder.toString());
    setDelayDays(step.delayDays.toString());
    setSelectedTemplateId(step.templateId || '');
    setGoal(step.goal || '');
    setActive(step.active);
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
    const delayNum = parseInt(delayDays, 10);

    if (isNaN(orderNum) || orderNum <= 0) {
      setDrawerError('Step Order must be a positive integer.');
      return;
    }
    if (isNaN(delayNum) || delayNum < 0) {
      setDrawerError('Delay days must be 0 or greater.');
      return;
    }

    setIsSaving(true);
    setDrawerError(null);

    const payload = {
      sequenceId,
      stepOrder: orderNum,
      delayDays: delayNum,
      channel: 'WHATSAPP' as const,
      templateId: selectedTemplateId,
      goal: goal.trim(),
      active
    };

    try {
      if (editingStep) {
        await updateFollowUpStep(editingStep.id, {
          stepOrder: payload.stepOrder,
          delayDays: payload.delayDays,
          channel: payload.channel,
          templateId: payload.templateId,
          goal: payload.goal,
          active: payload.active
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

  return (
    <div className="space-y-6">
      {/* Top Banner and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b1222]/30 border border-slate-800/60 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              {sequenceName}
            </h3>
            <span className="text-[9px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-bold">
              Sequence Steps
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Automatic follow-up flow configuration. When a lead is moved to follow-ups, tasks are generated based on this timeline delay schedule.
          </p>
        </div>

        {isEditable && sequenceId && (
          <button
            onClick={openCreateDrawer}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-violet-500/10 cursor-pointer w-fit flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Sequence Step</span>
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
                    <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-lg border border-violet-500/15">
                      Step {step.stepOrder} • Day {step.delayDays}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="hidden lg:block h-4 w-4 text-slate-700" />
                    )}
                  </div>

                  {/* Step info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                      <span className="text-slate-500">{getChannelIcon(step.channel)}</span>
                      <span>{step.channel}</span>
                    </div>
                    <h4 className="text-[10.5px] font-bold text-slate-200 line-clamp-2 leading-relaxed">
                      {getStepTemplateLabel(step)}
                    </h4>
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

      {/* Edit Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-fade-in">
          {/* Backdrop Closer */}
          <div className="absolute inset-0 cursor-default" onClick={closeDrawer} />

          {/* Drawer container */}
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
                    {editingStep ? 'Modify delay offsets and template references' : 'Add a new trigger offset scheduled step'}
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
                {/* Channel Label */}
                <div className="bg-emerald-950/20 border border-emerald-900/20 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Communication Channel</span>
                  <p className="text-xs text-slate-350 font-medium">WhatsApp (Forced in Beta)</p>
                </div>

                {/* Step Order and Delay Days in 2 cols */}
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

                  {/* Delay Days */}
                  <div className="space-y-1.5">
                    <label htmlFor="delay-days" className="text-xs font-bold text-slate-350 block">Delay (Days) *</label>
                    <input
                      id="delay-days"
                      type="number"
                      min="0"
                      value={delayDays}
                      onChange={(e) => setDelayDays(e.target.value)}
                      placeholder="e.g. 3"
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
                    <span className="text-xs text-slate-350 font-medium">
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
    </div>
  );
};
