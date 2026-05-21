import React, { useState, useEffect } from 'react';
import type {
  EventAssignment,
  EventAssignmentCreateRequest,
  AssignmentRole,
  AssignmentStatus,
} from '../types';
import type { Employee } from '../../employees/types';
import { AlertTriangle } from 'lucide-react';

interface AssignmentFormProps {
  initialData?: EventAssignment | null;
  eventId: string;
  employees: Employee[];
  onSubmit: (data: EventAssignmentCreateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

const ROLES: { value: AssignmentRole; label: string }[] = [
  { value: 'TRADITIONAL_PHOTOGRAPHER', label: 'Traditional Photographer' },
  { value: 'TRADITIONAL_VIDEOGRAPHER', label: 'Traditional Videographer' },
  { value: 'CANDID_PHOTOGRAPHER', label: 'Candid Photographer' },
  { value: 'CINEMATOGRAPHER', label: 'Cinematographer' },
  { value: 'DRONE_OPERATOR', label: 'Drone Operator' },
  { value: 'LIGHTING_ASSISTANT', label: 'Lighting Assistant' },
  { value: 'ASSISTANT', label: 'Assistant' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'OTHER', label: 'Other' },
];

const STATUSES: { value: AssignmentStatus; label: string }[] = [
  { value: 'PROPOSED', label: 'Proposed' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  initialData,
  eventId,
  employees,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}) => {
  const [employeeId, setEmployeeId] = useState('');
  const [assignmentRole, setAssignmentRole] = useState<AssignmentRole>('TRADITIONAL_PHOTOGRAPHER');
  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus>('PROPOSED');
  const [callTime, setCallTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter employees to show active ones, but always include the currently assigned employee
  const activeEmployees = employees.filter(
    (emp) => emp.status === 'ACTIVE' || emp.id === initialData?.employeeId
  );

  useEffect(() => {
    if (initialData) {
      setEmployeeId(initialData.employeeId || '');
      setAssignmentRole(initialData.assignmentRole || 'TRADITIONAL_PHOTOGRAPHER');
      setAssignmentStatus(initialData.assignmentStatus || 'PROPOSED');
      
      // Format callTime from HH:MM:ss to HH:MM for time input
      const formatTimeInput = (t: string) => {
        if (!t) return '09:00';
        const parts = t.split(':');
        if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
        return t;
      };
      setCallTime(formatTimeInput(initialData.callTime));
      setNotes(initialData.notes || '');
    } else {
      setEmployeeId(activeEmployees[0]?.id || '');
      setAssignmentRole('TRADITIONAL_PHOTOGRAPHER');
      setAssignmentStatus('PROPOSED');
      setCallTime('09:00');
      setNotes('');
    }
    setValidationError(null);
  }, [initialData, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!employeeId) {
      setValidationError('Employee is required.');
      return;
    }
    if (!assignmentRole) {
      setValidationError('Role is required.');
      return;
    }
    if (!callTime) {
      setValidationError('Call time is required.');
      return;
    }

    // Append seconds for backend LocalTime parsing
    const formatPayloadTime = (time: string) => {
      if (time.split(':').length === 2) {
        return `${time}:00`;
      }
      return time;
    };

    const payload: EventAssignmentCreateRequest = {
      eventId,
      employeeId,
      assignmentRole,
      assignmentStatus,
      callTime: formatPayloadTime(callTime),
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

      {/* Employee Select */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Team Member <span className="text-rose-500">*</span>
        </label>
        <select
          required
          disabled={isSubmitting || !!initialData}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        >
          <option value="" disabled>Select an employee</option>
          {activeEmployees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.fullName} ({emp.primaryRole})
            </option>
          ))}
        </select>
        {initialData && (
          <p className="text-[10px] text-slate-500">
            Employee cannot be changed once assigned. Re-assign by deleting and creating a new assignment.
          </p>
        )}
      </div>

      {/* Role Select */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Role <span className="text-rose-500">*</span>
        </label>
        <select
          disabled={isSubmitting}
          value={assignmentRole}
          onChange={(e) => setAssignmentRole(e.target.value as AssignmentRole)}
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        >
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Select */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Assignment Status <span className="text-rose-500">*</span>
        </label>
        <select
          disabled={isSubmitting}
          value={assignmentStatus}
          onChange={(e) => setAssignmentStatus(e.target.value as AssignmentStatus)}
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        >
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Call Time */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Call Time <span className="text-rose-500">*</span>
        </label>
        <input
          type="time"
          required
          disabled={isSubmitting}
          value={callTime}
          onChange={(e) => setCallTime(e.target.value)}
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Assignment Notes
        </label>
        <textarea
          disabled={isSubmitting}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Bring drone spare batteries, meet at venue main gate."
          rows={3}
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
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
          {isSubmitting ? 'Saving...' : initialData ? 'Update Assignment' : 'Assign Crew'}
        </button>
      </div>
    </form>
  );
};
