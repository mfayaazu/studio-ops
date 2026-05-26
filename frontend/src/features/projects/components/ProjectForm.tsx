import React, { useState, useEffect } from 'react';
import type { Project, ProjectCreateRequest, ProjectStatus, BookingStatus, PaymentStatus } from '../types';
import type { ClientResponse } from '../../clients/types';
import { AlertTriangle } from 'lucide-react';

interface ProjectFormProps {
  initialData?: Project | null;
  clients: ClientResponse[];
  onSubmit: (data: ProjectCreateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDelete?: (id: string, code: string) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  clients,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  onDelete
}) => {
  const [clientId, setClientId] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('INQUIRY');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [status, setStatus] = useState<ProjectStatus>('LEAD');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setClientId(initialData.clientId || '');
      setProjectCode(initialData.projectCode || '');
      setTitle(initialData.title || '');
      setProjectType(initialData.projectType || '');
      setBookingStatus(initialData.bookingStatus || 'INQUIRY');
      setPaymentStatus(initialData.paymentStatus || 'UNPAID');
      setStatus(initialData.status || 'LEAD');
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setNotes(initialData.notes || '');
    } else {
      setClientId(clients[0]?.id || '');
      // Auto-generate project code for preview e.g., RSA-YYYY-RANDOM
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      setProjectCode(`RSA-${year}-${random}`);
      setTitle('');
      setProjectType('Wedding Photography');
      setBookingStatus('INQUIRY');
      setPaymentStatus('UNPAID');
      setStatus('LEAD');
      setStartDate('');
      setEndDate('');
      setNotes('');
    }
    setValidationError(null);
  }, [initialData, clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!clientId) {
      setValidationError('Client Link is required.');
      return;
    }
    if (!projectCode.trim()) {
      setValidationError('Project Code is required.');
      return;
    }
    if (!title.trim()) {
      setValidationError('Project Title is required.');
      return;
    }
    if (!projectType.trim()) {
      setValidationError('Project Type is required.');
      return;
    }
    
    // Validate that startDate is not after endDate
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setValidationError('Start Date cannot be after End Date.');
      return;
    }

    const payload: ProjectCreateRequest = {
      clientId,
      assignedProjectManagerId: undefined, // Keep as null/undefined for now as requested
      projectCode: projectCode.trim(),
      title: title.trim(),
      projectType: projectType.trim(),
      bookingStatus,
      paymentStatus,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Project Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors font-mono disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Client Link <span className="text-rose-500">*</span>
          </label>
          <select
            required
            disabled={isSubmitting || clients.length === 0}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          >
            {clients.length === 0 && (
              <option value="">No clients available</option>
            )}
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Project Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={isSubmitting}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Fayaaz & Fatima - Destination Wedding"
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Project Type <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            placeholder="e.g. Wedding, Corporate Event, Portrait"
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Assigned PM (Read-Only)
          </label>
          <input
            type="text"
            disabled
            value="Project Manager allocation disabled (will be enabled after User/Auth)"
            className="w-full bg-[#0d1424] border border-slate-900 rounded-lg px-3 py-2 text-[11px] text-slate-500 focus:outline-none cursor-not-allowed font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Booking Status
          </label>
          <select
            disabled={isSubmitting}
            value={bookingStatus}
            onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          >
            <option value="INQUIRY">Inquiry</option>
            <option value="QUOTED">Quoted</option>
            <option value="CONTRACT_SIGNED">Contract Signed</option>
            <option value="DEPOSIT_PAID">Deposit Paid</option>
            <option value="FULLY_BOOKED">Fully Booked</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Payment Status
          </label>
          <select
            disabled={isSubmitting}
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          >
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="FULLY_PAID">Fully Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Pipeline Status
          </label>
          <select
            disabled={isSubmitting}
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          >
            <option value="LEAD">Lead</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="SHOOT_COMPLETED">Shoot Completed</option>
            <option value="POST_PRODUCTION">Post Production</option>
            <option value="DELIVERED">Delivered</option>
            <option value="ARCHIVED">Archived</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Start Date
          </label>
          <input
            type="date"
            disabled={isSubmitting}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            End Date
          </label>
          <input
            type="date"
            disabled={isSubmitting}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Internal Notes
        </label>
        <textarea
          disabled={isSubmitting}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Details on requirements, package details, gear restrictions..."
          rows={3}
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none disabled:opacity-50"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
        {initialData && onDelete && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onDelete(initialData.id, initialData.projectCode)}
            className="mr-auto px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-350 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Delete
          </button>
        )}
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
          disabled={isSubmitting || clients.length === 0}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};
