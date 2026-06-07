import React, { useState, useEffect } from 'react';
import type { Quotation, QuotationCreateRequest, QuotationStatus } from '../types';
import type { ClientResponse } from '../../clients/types';
import type { ProjectResponse } from '../../projects/types';
import type { LeadResponse } from '../../followup/types';
import { QuotationStatusBadge } from './QuotationStatusBadge';
import { formatCurrencyINR } from '../../../lib/formatters';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface QuotationFormProps {
  initialData?: Quotation | null;
  clients: ClientResponse[];
  projects: ProjectResponse[];
  leads: LeadResponse[];
  onSubmit: (data: QuotationCreateRequest) => Promise<void>;
  onUpdateStatus?: (status: QuotationStatus) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDelete?: (id: string, quotationNumber: string) => void;
  isReadOnly?: boolean;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  initialData,
  clients,
  projects,
  leads,
  onSubmit,
  onUpdateStatus,
  onCancel,
  isSubmitting,
  submitError,
  onDelete,
  isReadOnly = false
}) => {
  const [title, setTitle] = useState('');
  const [quotationNumber, setQuotationNumber] = useState('');
  const [leadId, setLeadId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [clientId, setClientId] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [validUntil, setValidUntil] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setQuotationNumber(initialData.quotationNumber || '');
      setLeadId(initialData.leadId || '');
      setProjectId(initialData.projectId || '');
      setClientId(initialData.clientId || '');
      setSubtotal(initialData.subtotal || 0);
      setDiscountAmount(initialData.discountAmount || 0);
      setTaxAmount(initialData.taxAmount || 0);
      setCurrency(initialData.currency || 'INR');
      setValidUntil(initialData.validUntil || '');
      setDescription(initialData.description || '');
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setQuotationNumber('');
      setLeadId('');
      setProjectId('');
      setClientId('');
      setSubtotal(0);
      setDiscountAmount(0);
      setTaxAmount(0);
      setCurrency('INR');
      setValidUntil('');
      setDescription('');
      setNotes('');
    }
    setValidationError(null);
  }, [initialData]);

  const previewTotal = subtotal - discountAmount + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Title is required.');
      return;
    }

    const payload: QuotationCreateRequest = {
      title: title.trim(),
      quotationNumber: quotationNumber.trim() || undefined,
      leadId: leadId || undefined,
      projectId: projectId || undefined,
      clientId: clientId || undefined,
      subtotal,
      discountAmount,
      taxAmount,
      currency,
      validUntil: validUntil || undefined,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    await onSubmit(payload);
  };

  const displayedError = validationError || submitError;

  return (
    <div className="space-y-6">
      {initialData && onUpdateStatus && !isReadOnly && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Quotation Status
            </span>
            <QuotationStatusBadge status={initialData.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            {initialData.status === 'DRAFT' && (
              <button
                type="button"
                onClick={() => onUpdateStatus('SENT')}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Mark as Sent
              </button>
            )}
            {initialData.status === 'SENT' && (
              <>
                <button
                  type="button"
                  onClick={() => onUpdateStatus('ACCEPTED')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Mark as Accepted
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus('REJECTED')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Mark as Rejected
                </button>
              </>
            )}
            {initialData.status !== 'CANCELLED' && initialData.status !== 'ACCEPTED' && (
              <button
                type="button"
                onClick={() => onUpdateStatus('CANCELLED')}
                className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel Quotation
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {displayedError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-455 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{displayedError}</span>
          </div>
        )}

        <fieldset disabled={isSubmitting || isReadOnly} className="space-y-4 border-0 p-0 m-0">

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Quotation Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wedding Golden Package Quotation"
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-mono">
              Quotation Number (Optional)
            </label>
            <input
              type="text"
              disabled={isSubmitting || !!initialData}
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 disabled:text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Valid Until
            </label>
            <input
              type="date"
              disabled={isSubmitting}
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div className="px-4 py-3 bg-[#0d1424] border border-slate-800/80 rounded-xl space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Linked Context References</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-450 uppercase block">Client</label>
              <select
                disabled={isSubmitting}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
              >
                <option value="">None</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-450 uppercase block">Lead</label>
              <select
                disabled={isSubmitting}
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
              >
                <option value="">None</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.clientName} ({l.eventType || 'Lead'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-450 uppercase block">Project</label>
              <select
                disabled={isSubmitting}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectCode} - {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border border-slate-800/80 rounded-xl p-4 bg-slate-900/10 space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pricing Configuration</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Subtotal
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                disabled={isSubmitting}
                value={subtotal || ''}
                onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Discount Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                disabled={isSubmitting}
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Tax Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                disabled={isSubmitting}
                value={taxAmount || ''}
                onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Currency
              </label>
              <select
                disabled={isSubmitting}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div className="bg-[#090d16] border border-slate-800/80 rounded-xl p-3 flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimated Total</span>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 font-mono">
                {formatCurrencyINR(previewTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Description
          </label>
          <textarea
            disabled={isSubmitting}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline coverage details, shoot schedule..."
            rows={2}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Client Terms / Notes
          </label>
          <textarea
            disabled={isSubmitting}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment schedules, validity terms..."
            rows={2}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none disabled:opacity-50"
          />
        </div>

        </fieldset>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
          {initialData && onDelete && !isReadOnly && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onDelete(initialData.id, initialData.quotationNumber)}
              className="mr-auto px-4 py-2 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-350 hover:text-rose-455 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          )}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>
          {!isReadOnly && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Quotation'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
