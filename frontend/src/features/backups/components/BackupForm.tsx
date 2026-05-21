import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { BackupRecord, BackupType, BackupLocationType, BackupStatus } from '../types';
import type { Project } from '../../projects/types';
import type { Deliverable } from '../../deliverables/types';

interface BackupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  initialData?: BackupRecord;
  projects: Project[];
  deliverables: Deliverable[];
}

const BACKUP_TYPES: { value: BackupType; label: string }[] = [
  { value: 'RAW_PHOTOS', label: 'Raw Photos' },
  { value: 'RAW_VIDEOS', label: 'Raw Videos' },
  { value: 'EDITED_PHOTOS', label: 'Edited Photos' },
  { value: 'FINAL_VIDEO', label: 'Final Video' },
  { value: 'ALBUM_FILES', label: 'Album Files' },
  { value: 'FINAL_DELIVERY', label: 'Final Delivery' },
  { value: 'PROJECT_ARCHIVE', label: 'Project Archive' },
];

const LOCATION_TYPES: { value: BackupLocationType; label: string }[] = [
  { value: 'LOCAL_NAS', label: 'Local NAS' },
  { value: 'EXTERNAL_HARD_DRIVE', label: 'External Hard Drive' },
  { value: 'CLOUD_S3', label: 'Cloud S3 (AWS/R2)' },
];

const STATUSES: { value: BackupStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'NEEDS_ATTENTION', label: 'Needs Attention' },
];

const toDatetimeLocal = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  } catch {
    return '';
  }
};

const toISOString = (datetimeLocal?: string): string | undefined => {
  if (!datetimeLocal) return undefined;
  try {
    return new Date(datetimeLocal).toISOString();
  } catch {
    return undefined;
  }
};

export const BackupForm: React.FC<BackupFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  projects,
  deliverables,
}) => {
  const isEdit = !!initialData;

  const [projectId, setProjectId] = useState('');
  const [deliverableId, setDeliverableId] = useState('');
  const [backupType, setBackupType] = useState<BackupType>('RAW_PHOTOS');
  const [locationType, setLocationType] = useState<BackupLocationType>('LOCAL_NAS');
  const [destinationPath, setDestinationPath] = useState('');
  const [status, setStatus] = useState<BackupStatus>('PENDING');
  const [verifiedAtLocal, setVerifiedAtLocal] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with initialData when open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setProjectId(initialData.projectId);
        setDeliverableId(initialData.deliverableId || '');
        setBackupType(initialData.backupType);
        setLocationType(initialData.locationType);
        setDestinationPath(initialData.destinationPath);
        setStatus(initialData.status);
        setVerifiedAtLocal(toDatetimeLocal(initialData.verifiedAt));
        setNotes(initialData.notes || '');
      } else {
        setProjectId('');
        setDeliverableId('');
        setBackupType('RAW_PHOTOS');
        setLocationType('LOCAL_NAS');
        setDestinationPath('');
        setStatus('PENDING');
        setVerifiedAtLocal('');
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  // Filter deliverables based on selected project
  const filteredDeliverables = deliverables.filter(d => d.projectId === projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError('Project selection is required');
      return;
    }
    if (!destinationPath.trim()) {
      setError('Destination path is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const verifiedAt = toISOString(verifiedAtLocal);
      
      if (isEdit) {
        // Payload matches BackupRecordUpdateRequest (exclude projectId, deliverableId)
        await onSave({
          backupType,
          locationType,
          destinationPath: destinationPath.trim(),
          status,
          notes: notes.trim() || undefined,
          verifiedAt,
        });
      } else {
        // Payload matches BackupRecordCreateRequest
        await onSave({
          projectId,
          deliverableId: deliverableId || undefined,
          backupType,
          locationType,
          destinationPath: destinationPath.trim(),
          status,
          notes: notes.trim() || undefined,
          verifiedAt,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save backup record');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? 'Edit Backup Record' : 'Add Backup Record'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Project SELECT */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Project <span className="text-rose-500">*</span>
            </label>
            <select
              disabled={isEdit}
              value={projectId}
              onChange={e => {
                setProjectId(e.target.value);
                setDeliverableId(''); // reset deliverable
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.projectCode}] {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Deliverable SELECT */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Deliverable (Optional)
            </label>
            <select
              disabled={isEdit || !projectId}
              value={deliverableId}
              onChange={e => setDeliverableId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">None / Not Tied to Deliverable</option>
              {filteredDeliverables.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.deliverableType})
                </option>
              ))}
            </select>
          </div>

          {/* Backup Type & Location Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Backup Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={backupType}
                onChange={e => setBackupType(e.target.value as BackupType)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                {BACKUP_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Location Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={locationType}
                onChange={e => setLocationType(e.target.value as BackupLocationType)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                {LOCATION_TYPES.map(loc => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destination Path */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Destination Path <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={destinationPath}
              onChange={e => setDestinationPath(e.target.value)}
              placeholder="e.g. s3://studio-photos/wedding-john-doe/raw/"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          {/* Status & Verified At */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as BackupStatus)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Verified At (Optional)
              </label>
              <input
                type="datetime-local"
                value={verifiedAtLocal}
                onChange={e => setVerifiedAtLocal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional information, folder specifications, password links..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg"
            >
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
