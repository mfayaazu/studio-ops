import React, { useState, useEffect, useRef } from 'react';
import type { MessageTemplate, TemplateType } from '../types';
import { 
  fetchMessageTemplates, 
  createMessageTemplate, 
  updateMessageTemplate, 
  deleteMessageTemplate 
} from '../api/followupApi';
import { 
  MessageSquare, 
  Plus, 
  X, 
  Check, 
  AlertTriangle, 
  Loader2, 
  Trash2, 
  Send,
  Sliders,
  CheckCheck,
  Eye
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useAuth } from '../../auth/AuthProvider';

export const MessageTemplatesPage: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
  const { user } = useAuth();
  const isEditable = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [templateType, setTemplateType] = useState<TemplateType>('SOFT_FOLLOW_UP');
  const [body, setBody] = useState('');
  const [active, setActive] = useState(true);
  
  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load templates
  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await fetchMessageTemplates();
      // Filter templates to WHATSAPP only for beta
      setTemplates(fetched.filter(t => t.channel === 'WHATSAPP'));
    } catch (err: any) {
      console.error('Failed to load message templates:', err);
      setError('Failed to load message templates from the database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openCreateDrawer = () => {
    setEditingTemplate(null);
    setName('');
    setTemplateType('SOFT_FOLLOW_UP');
    setBody('');
    setActive(true);
    setDrawerError(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setTemplateType(template.templateType);
    setBody(template.body);
    setActive(template.active);
    setDrawerError(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingTemplate(null);
    setDrawerError(null);
  };

  // Variable chip handler
  const insertPlaceholder = (placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = body;
    const newText = currentText.substring(0, start) + placeholder + currentText.substring(end);
    
    setBody(newText);
    
    // Focus back and position cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + placeholder.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Render WhatsApp preview
  const getRenderedPreview = (text: string) => {
    if (!text) return "Type a message to see a live preview of how it will render in WhatsApp...";
    return text
      .replace(/\{\{clientName\}\}/g, "Ananya Sen")
      .replace(/\{\{projectTitle\}\}/g, "Wedding Photography & Video")
      .replace(/\{\{eventDate\}\}/g, "June 12, 2026")
      .replace(/\{\{quotationAmount\}\}/g, "₹2,50,000")
      .replace(/\{\{studioName\}\}/g, "Aura Studios");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setDrawerError('Template name is required.');
      return;
    }
    if (!body.trim()) {
      setDrawerError('Message body is required.');
      return;
    }

    setIsSaving(true);
    setDrawerError(null);

    const payload = {
      name: name.trim(),
      channel: 'WHATSAPP' as const,
      templateType,
      subject: undefined,
      body: body.trim(),
      active
    };

    try {
      if (editingTemplate) {
        await updateMessageTemplate(editingTemplate.id, payload);
      } else {
        await createMessageTemplate(payload);
      }
      await loadTemplates();
      closeDrawer();
    } catch (err: any) {
      console.error('Failed to save template:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save message template.';
      setDrawerError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTemplate) return;
    if (!window.confirm(`Are you sure you want to delete "${editingTemplate.name}"?`)) return;

    setIsDeleting(true);
    setDrawerError(null);

    try {
      await deleteMessageTemplate(editingTemplate.id);
      await loadTemplates();
      closeDrawer();
    } catch (err: any) {
      console.error('Failed to delete template:', err);
      // Retrieve friendly error message from backend
      const errMsg = err.response?.data?.message || err.message || '';
      if (errMsg.includes('used in a follow-up sequence')) {
        setDrawerError('Cannot delete template because it is currently used in a follow-up sequence. Please deactivate it instead or remove it from the sequence.');
      } else {
        setDrawerError(errMsg || 'Failed to delete template.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case 'QUOTE_SENT':
        return 'Quote Sent';
      case 'SOFT_FOLLOW_UP':
        return 'Soft Follow-up';
      case 'VALUE_FOLLOW_UP':
        return 'Value Follow-up';
      case 'SCARCITY_FOLLOW_UP':
        return 'Scarcity Follow-up';
      case 'FINAL_FOLLOW_UP':
        return 'Final Closure';
      case 'CUSTOM':
        return 'Custom/Other';
      default:
        return type;
    }
  };

  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto text-slate-100", isEmbedded ? "p-0" : "p-4 md:p-6")}>
      {/* Top Banner */}
      {!isEmbedded ? (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-heading text-white">Message Templates</h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure default and custom WhatsApp templates for studio campaigns and client inquiries.
            </p>
          </div>
          {isEditable && (
            <button
              onClick={openCreateDrawer}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-violet-500/10 cursor-pointer w-fit"
            >
              <Plus className="h-4 w-4" />
              <span>Create Template</span>
            </button>
          )}
        </div>
      ) : (
        isEditable ? (
          <div className="flex justify-end">
            <button
              onClick={openCreateDrawer}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all shadow-lg shadow-violet-500/10 cursor-pointer w-fit"
            >
              <Plus className="h-4 w-4" />
              <span>Create Template</span>
            </button>
          </div>
        ) : null
      )}

      {/* Beta Wording Waning Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3.5 shadow-md">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex-shrink-0">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-200">Beta Communication Channel: WhatsApp Only</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All system templates must be formatted for WhatsApp messaging. Placeholders will automatically resolve using real client and project metadata during sequencing. Email and SMS templates are disabled during this beta stage.
          </p>
        </div>
      </div>

      {/* Templates List Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-[#0d1424]/40 border border-slate-800/80 rounded-2xl">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
          <span className="text-slate-400 text-xs font-medium">Loading templates...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-4">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto" />
          <h3 className="text-white font-semibold">Error Loading Templates</h3>
          <p className="text-xs text-slate-400">{error}</p>
          <button 
            onClick={loadTemplates}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-[#0d1424]/20 border border-dashed border-slate-800 rounded-2xl space-y-4">
          <MessageSquare className="h-10 w-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-350">No Templates Found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Create your first WhatsApp message template to begin automating client follow-ups.
            </p>
          </div>
          <button
            onClick={openCreateDrawer}
            className="bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            Add New Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-[#0b1222]/80 border border-slate-850/80 hover:border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between group transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Name and Active tag */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors mr-2">
                    {template.name}
                  </h3>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    template.active 
                      ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" 
                      : "bg-slate-800/40 text-slate-500 border-slate-800"
                  )}>
                    {template.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Meta details */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold font-mono">
                  <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-violet-400">
                    {getTemplateTypeLabel(template.templateType)}
                  </span>
                  <span className="bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded text-emerald-500">
                    WhatsApp Only
                  </span>
                </div>

                {/* Preview bubble */}
                <div className="bg-[#090d16]/80 border border-slate-900 rounded-xl p-3 text-xs text-slate-400 relative overflow-hidden">
                  <p className="whitespace-pre-line line-clamp-5 leading-relaxed font-sans">
                    {template.body}
                  </p>
                </div>
              </div>

              {/* Action area */}
              <div className="pt-3 border-t border-slate-900/60 flex justify-end">
                <button
                  onClick={() => openEditDrawer(template)}
                  className={cn(
                    "text-xs font-bold transition-colors flex items-center gap-1.5 py-1 px-3 bg-slate-900/50 hover:bg-slate-800/40 rounded-lg cursor-pointer border border-slate-800/40",
                    isEditable ? "text-violet-400 hover:text-violet-300" : "text-slate-400 hover:text-slate-300"
                  )}
                >
                  {isEditable ? <Sliders className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{isEditable ? 'Configure' : 'View Template'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-fade-in">
          {/* Backdrop Closer */}
          <div className="absolute inset-0 cursor-default" onClick={closeDrawer} />

          {/* Drawer container */}
          <div className="relative w-full max-w-4xl bg-[#090f1e] border-l border-slate-800/80 shadow-2xl flex flex-col h-full animate-slide-in">
            {/* Header */}
            <div className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create WhatsApp Template'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {editingTemplate ? 'Modify properties and message body' : 'Add new default studio template'}
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

            {/* Error notifications */}
            {drawerError && (
              <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-start gap-2.5 text-xs text-red-200">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">{drawerError}</p>
              </div>
            )}

            {/* Drawer Body - Split Layout */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form Controls */}
              <form onSubmit={handleSave} className="lg:col-span-7 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-5">
                  {/* Template Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="template-name" className="text-xs font-bold text-slate-350 block">Template Name *</label>
                    <input
                      id="template-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Booking Confirmation Followup"
                      className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      required
                      disabled={!isEditable}
                    />
                  </div>

                  {/* Template Type & Active Toggle in 2 cols */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Type */}
                    <div className="space-y-1.5">
                      <label htmlFor="template-type" className="text-xs font-bold text-slate-350 block">Template Type/Category *</label>
                      <select
                        id="template-type"
                        value={templateType}
                        onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                        className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!isEditable}
                      >
                        <option value="QUOTE_SENT">Quote Sent</option>
                        <option value="SOFT_FOLLOW_UP">Soft Follow-up</option>
                        <option value="VALUE_FOLLOW_UP">Value Follow-up</option>
                        <option value="SCARCITY_FOLLOW_UP">Scarcity Follow-up</option>
                        <option value="FINAL_FOLLOW_UP">Final Closure</option>
                        <option value="CUSTOM">Custom/Other</option>
                      </select>
                    </div>

                    {/* Active Flag */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-350 block">Status</label>
                      <div 
                        onClick={() => isEditable && setActive(!active)}
                        className={cn(
                          "flex items-center justify-between bg-[#070b14] border border-slate-800/80 rounded-xl px-4 py-2.5 select-none transition-colors",
                          isEditable ? "cursor-pointer hover:border-slate-700/60" : "cursor-not-allowed opacity-60"
                        )}
                      >
                        <span className="text-xs text-slate-300 font-medium">
                          {active ? 'Enabled / Active' : 'Disabled / Inactive'}
                        </span>
                        <div className={cn(
                          "w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out",
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

                  {/* Body Textarea */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="template-body" className="text-xs font-bold text-slate-350">Message Body *</label>
                      <span className="text-[10px] text-slate-500 font-mono">Format: Text only</span>
                    </div>
                    <textarea
                      id="template-body"
                      ref={textareaRef}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="e.g. Hello {{clientName}}, thank you for booking your event with us!"
                      className="w-full bg-[#070b14] border border-slate-800/80 focus:border-violet-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 outline-none h-44 font-sans leading-relaxed resize-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      required
                      disabled={!isEditable}
                    />
                  </div>

                  {/* Placeholder variable chips */}
                  {isEditable && (
                    <div className="space-y-2 bg-[#070b14]/50 border border-slate-850 p-3.5 rounded-xl">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Insert Studio Variables
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Click a chip below to insert the placeholder template code at your current cursor position:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {[
                          { code: '{{clientName}}', label: 'Client Name' },
                          { code: '{{projectTitle}}', label: 'Project Type' },
                          { code: '{{eventDate}}', label: 'Event Date' },
                          { code: '{{quotationAmount}}', label: 'Quote Value' },
                          { code: '{{studioName}}', label: 'Studio Name' },
                        ].map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => insertPlaceholder(item.code)}
                            className="bg-slate-900 hover:bg-slate-800 hover:text-violet-300 border border-slate-800 hover:border-violet-500/20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold text-slate-400 transition-all cursor-pointer"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Save and Actions footer */}
                <div className="pt-6 border-t border-slate-850 flex justify-between items-center gap-3">
                  <div>
                    {isEditable && editingTemplate && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting || isSaving}
                        className="inline-flex items-center gap-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 hover:border-rose-500/20 text-rose-400 text-xs font-semibold py-2 px-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                      >
                        {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        <span>Delete Template</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={closeDrawer}
                      disabled={isSaving || isDeleting}
                      className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isEditable ? 'Cancel' : 'Close'}
                    </button>
                    {isEditable && (
                      <button
                        type="submit"
                        disabled={isSaving || isDeleting}
                        className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2 px-5 rounded-xl transition-all shadow-lg shadow-violet-500/10 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        <span>Save Template</span>
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Right Column: Live Phone Mockup Preview */}
              <div className="lg:col-span-5 flex flex-col justify-start">
                <div className="sticky top-0 space-y-3">
                  <h4 className="text-xs font-bold text-slate-350">Live WhatsApp Render</h4>
                  <p className="text-[10px] text-slate-500">
                    Preview how client placeholders resolve when dispatching a manual follow-up step.
                  </p>

                  {/* Phone Chassis Mock */}
                  <div className="w-full max-w-[310px] mx-auto rounded-[36px] border-4 border-slate-800 bg-[#0f172a] shadow-xl overflow-hidden relative aspect-[9/18] flex flex-col">
                    {/* Speaker notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                      <div className="w-8 h-1 bg-slate-800 rounded-full" />
                    </div>

                    {/* Chat Header Mock */}
                    <div className="bg-[#075e54] text-white p-3 pt-7 flex items-center gap-2 flex-shrink-0">
                      <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 font-mono">
                        AS
                      </div>
                      <div className="min-w-0">
                        <h6 className="text-[10px] font-bold truncate leading-tight">Ananya Sen (Client)</h6>
                        <span className="text-[7px] text-[#b3e5fc] block leading-none font-semibold mt-0.5">Online</span>
                      </div>
                    </div>

                    {/* Chat Background Workspace */}
                    <div 
                      className="flex-1 p-3.5 flex flex-col justify-end overflow-y-auto"
                      style={{ 
                        backgroundImage: `radial-gradient(#128c7e 0.5px, transparent 0.5px), radial-gradient(#128c7e 0.5px, #0b1424 0.5px)`,
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 8px 8px',
                        opacity: 0.95
                      }}
                    >
                      {/* WhatsApp Outbound bubble */}
                      <div className="max-w-[85%] ml-auto bg-[#054735] text-slate-100 rounded-t-xl rounded-bl-xl p-3.5 shadow-md relative text-[10.5px] leading-relaxed font-sans text-left border-l-2 border-[#128c7e]">
                        <p className="whitespace-pre-wrap select-text pr-3 font-medium">
                          {getRenderedPreview(body)}
                        </p>
                        
                        {/* Timestamp & double checks */}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[7px] text-emerald-400 font-bold leading-none w-full select-none">
                          <span>10:42 PM</span>
                          <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
                        </div>
                      </div>
                    </div>

                    {/* Input tray footer mock */}
                    <div className="bg-[#080d16] p-2 flex items-center gap-1.5 border-t border-slate-900 flex-shrink-0">
                      <div className="flex-1 bg-[#152033] rounded-full px-3 py-1.5 text-[8.5px] text-slate-500 font-medium">
                        Send message...
                      </div>
                      <div className="h-7 w-7 rounded-full bg-[#128c7e] text-white flex items-center justify-center flex-shrink-0 shadow shadow-teal-500/20">
                        <Send className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
