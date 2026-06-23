import React, { useState, useEffect } from 'react';
import type { Client, ClientCreateRequest } from '../types';
import { AlertTriangle } from 'lucide-react';

interface ClientFormProps {
  initialData?: Client | null;
  onSubmit: (data: ClientCreateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setNotes(initialData.notes || '');
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setNotes('');
    }
    setValidationError(null);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!fullName.trim()) {
      setValidationError('Full Name is required.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('Phone Number is required.');
      return;
    }

    if (email.trim()) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        setValidationError('Please enter a valid email address.');
        return;
      }
    }

    const payload: ClientCreateRequest = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    await onSubmit(payload);
  };

  const displayedError = validationError || submitError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayedError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={isSubmitting}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Alice Smith"
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Phone Number <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={isSubmitting}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +46 70-123 45 67"
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Email Address
        </label>
        <input
          type="email"
          disabled={isSubmitting}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. alice@example.com"
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Internal Notes
        </label>
        <textarea
          disabled={isSubmitting}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Special instructions or background information..."
          rows={3}
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none disabled:opacity-50"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Register Client'}
        </button>
      </div>
    </form>
  );
};
