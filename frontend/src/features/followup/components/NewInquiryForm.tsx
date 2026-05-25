import React, { useState } from 'react';
import type { LeadCreateRequest, LeadPreferredChannel, LeadSource } from '../types';
import { X, Loader2, User, Phone, Mail, MapPin, DollarSign, Calendar, Clock, Sparkles } from 'lucide-react';

interface NewInquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: LeadCreateRequest) => Promise<void>;
}

export const NewInquiryForm: React.FC<NewInquiryFormProps> = ({ isOpen, onClose, onSubmit }) => {
  // Form field states
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<LeadPreferredChannel>('EMAIL');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [city, setCity] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [leadSource, setLeadSource] = useState<LeadSource>('WEBSITE');
  const [nextFollowUpAt, setNextFollowUpAt] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!clientName.trim()) {
      errors.clientName = 'Client Name is required';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Enter a valid email address';
      }
    }

    if (estimatedValue.trim()) {
      const parsedVal = parseFloat(estimatedValue);
      if (isNaN(parsedVal) || parsedVal <= 0) {
        errors.estimatedValue = 'Estimated Value must be a positive number';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: LeadCreateRequest = {
        clientName: clientName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        preferredChannel,
        eventType: eventType.trim() || undefined,
        eventDate: eventDate || undefined,
        city: city.trim() || undefined,
        estimatedValue: estimatedValue.trim() ? parseFloat(estimatedValue) : undefined,
        leadSource,
        nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt).toISOString() : undefined,
        notes: notes.trim() || undefined
      };

      await onSubmit(payload);

      // Reset form fields upon successful create
      setClientName('');
      setPhone('');
      setEmail('');
      setPreferredChannel('EMAIL');
      setEventType('');
      setEventDate('');
      setCity('');
      setEstimatedValue('');
      setLeadSource('WEBSITE');
      setNextFollowUpAt('');
      setNotes('');
      onClose();
    } catch (err: any) {
      console.error('Failed to submit new inquiry:', err);
      setErrorMessage(
        err?.message || 'Failed to create inquiry. Ensure the backend server is online and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300 animate-fadeIn"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-lg bg-[#0a0f1d] border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-slideIn">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
              Inquiry Management
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">Register New Inquiry</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Error notification banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-mono flex items-start justify-between gap-2">
              <span>{errorMessage}</span>
              <button 
                onClick={() => setErrorMessage(null)}
                className="text-[9px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200"
              >
                Dismiss
              </button>
            </div>
          )}

          <form id="new-inquiry-form" onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Client Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                <User className="h-3 w-3 text-slate-500" />
                <span>Client Name *</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Priya Reddy"
                className={`w-full bg-[#0d1222]/40 border ${
                  validationErrors.clientName ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-800 focus:ring-violet-500'
                } text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:outline-none transition-all`}
              />
              {validationErrors.clientName && (
                <span className="text-[10px] text-rose-400 block font-mono">{validationErrors.clientName}</span>
              )}
            </div>

            {/* Phone & Email (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-slate-500" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full bg-[#0d1222]/40 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-slate-500" />
                  <span>Email Address</span>
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className={`w-full bg-[#0d1222]/40 border ${
                    validationErrors.email ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-800 focus:ring-violet-500'
                  } text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:outline-none transition-all`}
                />
                {validationErrors.email && (
                  <span className="text-[10px] text-rose-400 block font-mono">{validationErrors.email}</span>
                )}
              </div>
            </div>

            {/* Preferred Channel & Lead Source (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                  Preferred Channel *
                </label>
                <select
                  value={preferredChannel}
                  onChange={(e) => setPreferredChannel(e.target.value as LeadPreferredChannel)}
                  className="w-full bg-[#0d1222]/60 border border-slate-800 text-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                >
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS</option>
                  <option value="PHONE_CALL">Phone Call</option>
                  <option value="MANUAL">Manual Outbox</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                  Lead Source *
                </label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                  className="w-full bg-[#0d1222]/60 border border-slate-800 text-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                >
                  <option value="WEBSITE">Website Form</option>
                  <option value="WHATSAPP">WhatsApp chat</option>
                  <option value="INSTAGRAM">Instagram DM</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="WALK_IN">Walk In</option>
                  <option value="PHONE_CALL">Phone Call</option>
                  <option value="EMAIL">Direct Email</option>
                  <option value="MANUAL">Manual Logging</option>
                  <option value="IMPORT">CSV Import</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Event Type & Event Date (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-slate-500" />
                  <span>Event Type</span>
                </label>
                <input
                  type="text"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="Wedding Photography"
                  className="w-full bg-[#0d1222]/40 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  <span>Event Date</span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#0d1222]/40 border border-slate-800 text-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* City & Estimated Value (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span>City / Location</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Hyderabad"
                  className="w-full bg-[#0d1222]/40 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3 text-slate-500" />
                  <span>Estimated Deal Value</span>
                </label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="350000"
                  className={`w-full bg-[#0d1222]/40 border ${
                    validationErrors.estimatedValue ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-800 focus:ring-violet-500'
                  } text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:outline-none transition-all`}
                />
                {validationErrors.estimatedValue && (
                  <span className="text-[10px] text-rose-400 block font-mono">{validationErrors.estimatedValue}</span>
                )}
              </div>
            </div>

            {/* Next Follow-up Date/Time */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>Next Follow-up Date & Time</span>
              </label>
              <input
                type="datetime-local"
                value={nextFollowUpAt}
                onChange={(e) => setNextFollowUpAt(e.target.value)}
                className="w-full bg-[#0d1222]/40 border border-slate-800 text-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                Notes / Requirements
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Requested traditional albums and raw video footages..."
                className="w-full bg-[#0d1222]/40 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all resize-none"
              />
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end gap-2.5">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="py-2 px-4 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="new-inquiry-form"
            disabled={isSubmitting}
            className="py-2 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Inquiry</span>
            )}
          </button>
        </div>

      </div>
    </>
  );
};
