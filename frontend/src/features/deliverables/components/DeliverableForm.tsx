import React, { useState, useEffect } from 'react';
import type { Deliverable, DeliverableCreateRequest, DeliverableType, DeliverableStatus } from '../types';
import type { Project } from '../../projects/types';
import { AlertTriangle } from 'lucide-react';

interface DeliverableFormProps {
  initialData?: Deliverable | null;
  projects: Project[];
  onSubmit: (data: DeliverableCreateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDelete?: (id: string) => void;
}

const DELIVERABLE_TYPES: { value: DeliverableType; label: string }[] = [
  { value: 'PHOTOS', label: 'Photos' },
  { value: 'TEASER', label: 'Teaser' },
  { value: 'FULL_VIDEO', label: 'Full Video' },
  { value: 'ALBUM_SELECTION', label: 'Album Selection' },
  { value: 'ALBUM_DESIGN', label: 'Album Design' },
  { value: 'HARD_DISK', label: 'Hard Disk' },
  { value: 'OTHER', label: 'Other' },
];

const DELIVERABLE_STATUSES: { value: DeliverableStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_FOR_CLIENT', label: 'Waiting for Client' },
  { value: 'READY_FOR_REVIEW', label: 'Ready for Review' },
  { value: 'REVISION_REQUIRED', label: 'Revision Required' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const DeliverableForm: React.FC<DeliverableFormProps> = ({
  initialData,
  projects,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  onDelete,
}) => {
  const [projectId, setProjectId] = useState('');
  const [name, setName] = useState('');
  const [deliverableType, setDeliverableType] = useState<DeliverableType>('PHOTOS');
  const [status, setStatus] = useState<DeliverableStatus>('NOT_STARTED');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setProjectId(initialData.projectId || '');
      setName(initialData.name || '');
      setDeliverableType(initialData.deliverableType || 'PHOTOS');
      setStatus(initialData.status || 'NOT_STARTED');
      setReferenceUrl(initialData.referenceUrl || '');
      setDueDate(initialData.dueDate || '');
    } else {
      setProjectId(projects[0]?.id || '');
      setName('');
      setDeliverableType('PHOTOS');
      setStatus('NOT_STARTED');
      setReferenceUrl('');
      setDueDate('');
    }
    setValidationError(null);
  }, [initialData, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!projectId) {
      setValidationError('Project allocation is required.');
      return;
    }
    if (!name.trim()) {
      setValidationError('Deliverable name is required.');
      return;
    }

    const payload: DeliverableCreateRequest = {
      projectId,
      name: name.trim(),
      deliverableType,
      status,
      referenceUrl: referenceUrl.trim() || undefined,
      dueDate: dueDate || undefined,
    };

    await onSubmit(payload);
  };

  const displayedError = validationError || submitError;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-220px)] space-y-4 pr-1">
        {displayedError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{displayedError}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Project <span className="text-rose-500">*</span>
          </label>
          <select
            required
            disabled={isSubmitting || projects.length === 0}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          >
            {projects.length === 0 && (
              <option value="">No projects available</option>
            )}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.projectCode}] {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Deliverable Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Master High-Res Photos Album"
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Type <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={isSubmitting}
              value={deliverableType}
              onChange={(e) => setDeliverableType(e.target.value as DeliverableType)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            >
              {DELIVERABLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={isSubmitting}
              value={status}
              onChange={(e) => setStatus(e.target.value as DeliverableStatus)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            >
              {DELIVERABLE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Due Date
            </label>
            <input
              type="date"
              disabled={isSubmitting}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Reference Link / URL
            </label>
            <input
              type="url"
              disabled={isSubmitting}
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="e.g. https://dropbox.com/sh/..."
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-850 flex-none mt-4">
        {initialData && onDelete && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onDelete(initialData.id)}
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
          disabled={isSubmitting || projects.length === 0}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Deliverable'}
        </button>
      </div>
    </form>
  );
};
