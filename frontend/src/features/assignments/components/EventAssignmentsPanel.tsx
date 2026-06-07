import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle, RefreshCw, X } from 'lucide-react';
import { assignmentsApi } from '../api/assignmentsApi';
import { employeesApi } from '../../employees/api/employeesApi';
import type { EventAssignment, EventAssignmentCreateRequest } from '../types';
import type { Employee } from '../../employees/types';
import { AssignmentList } from './AssignmentList';
import { AssignmentForm } from './AssignmentForm';

interface EventAssignmentsPanelProps {
  eventId: string;
}

export const EventAssignmentsPanel: React.FC<EventAssignmentsPanelProps> = ({ eventId }) => {
  const [assignments, setAssignments] = useState<EventAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<EventAssignment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignmentsData, employeesData] = await Promise.all([
        assignmentsApi.getByEvent(eventId),
        employeesApi.list(),
      ]);
      setAssignments(assignmentsData);
      setEmployees(employeesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load team assignment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (assignment: EventAssignment) => {
    setEditingAssignment(assignment);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, employeeName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${employeeName} from this event?`)) {
      return;
    }
    setError(null);
    try {
      await assignmentsApi.delete(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message || `Failed to remove ${employeeName} assignment.`);
    }
  };

  const handleFormSubmit = async (payload: EventAssignmentCreateRequest) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingAssignment) {
        // Update
        const updated = await assignmentsApi.update(editingAssignment.id, payload);
        setAssignments((prev) =>
          prev.map((a) => (a.id === editingAssignment.id ? updated : a))
        );
      } else {
        // Create
        const created = await assignmentsApi.create(payload);
        setAssignments((prev) => [...prev, created]);
      }
      setIsFormOpen(false);
      setEditingAssignment(null);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Count conflicts
  const conflictCount = assignments.filter((a) => a.conflictWarning).length;

  return (
    <div className="space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Assigned Crew ({assignments.length})
          </h4>
          {conflictCount > 0 && (
            <p className="text-[10px] text-amber-400 font-medium">
              {conflictCount} conflict{conflictCount > 1 ? 's' : ''} detected
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850/50 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh team list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={loading || employees.length === 0}
            className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-lg hover:shadow-violet-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Assign Crew</span>
          </button>
        </div>
      </div>

      {/* Panel level errors */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadData}
              className="block mt-1 font-bold text-rose-300 hover:underline cursor-pointer"
            >
              Retry loading
            </button>
          </div>
        </div>
      )}

      {/* Main List */}
      {loading && assignments.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 font-mono animate-pulse">
          Loading assigned crew...
        </div>
      ) : (
        <AssignmentList
          assignments={assignments}
          employees={employees}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Assignment Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-850 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-48px)]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20 flex-shrink-0">
              <h3 className="text-white font-semibold text-sm">
                {editingAssignment ? 'Edit Crew Assignment' : 'Assign Crew Member'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body with Form */}
            <div className="p-5 overflow-y-auto">
              <AssignmentForm
                initialData={editingAssignment}
                eventId={eventId}
                employees={employees}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
                isSubmitting={isSubmitting}
                submitError={formError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
