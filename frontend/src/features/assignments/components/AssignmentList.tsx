import React from 'react';
import type { EventAssignment, AssignmentRole, AssignmentStatus } from '../types';
import type { Employee } from '../../employees/types';
import { Edit3, Trash2, AlertTriangle, Clock, MessageSquare, User } from 'lucide-react';

interface AssignmentListProps {
  assignments: EventAssignment[];
  employees: Employee[];
  onEdit: (assignment: EventAssignment) => void;
  onDelete: (id: string, employeeName: string) => void;
}

const getRoleLabel = (role: AssignmentRole): string => {
  switch (role) {
    case 'TRADITIONAL_PHOTOGRAPHER':
      return 'Traditional Photographer';
    case 'TRADITIONAL_VIDEOGRAPHER':
      return 'Traditional Videographer';
    case 'CANDID_PHOTOGRAPHER':
      return 'Candid Photographer';
    case 'CINEMATOGRAPHER':
      return 'Cinematographer';
    case 'DRONE_OPERATOR':
      return 'Drone Operator';
    case 'LIGHTING_ASSISTANT':
      return 'Lighting Assistant';
    case 'ASSISTANT':
      return 'Assistant';
    case 'EDITOR':
      return 'Editor';
    case 'OTHER':
      return 'Other';
    default:
      return role;
  }
};

const getStatusBadgeClass = (status: AssignmentStatus) => {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'PROPOSED':
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    case 'REJECTED':
      return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    case 'COMPLETED':
      return 'bg-violet-500/10 border-violet-500/20 text-violet-400';
    case 'CANCELLED':
      return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    default:
      return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
  }
};

export const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  employees,
  onEdit,
  onDelete,
}) => {
  const getEmployeeName = (employeeId: string): string => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? emp.fullName : `Unknown Employee (${employeeId.substring(0, 8)})`;
  };

  const formatCallTime = (t?: string) => {
    if (!t) return 'N/A';
    const parts = t.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return t;
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-6 border border-dashed border-slate-800/80 rounded-xl bg-slate-900/10">
        <User className="h-6 w-6 text-slate-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">No crew members assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => {
        const empName = getEmployeeName(assignment.employeeId);
        const conflictMsg = assignment.conflictReason || assignment.conflictMessage;

        return (
          <div
            key={assignment.id}
            className={`border rounded-xl p-3.5 bg-[#090d16]/50 hover:bg-[#090d16]/80 transition-colors flex flex-col gap-2.5 ${
              assignment.conflictWarning
                ? 'border-amber-500/30 shadow-sm shadow-amber-500/5'
                : 'border-slate-850/60'
            }`}
          >
            {/* Top row: Employee Name, Role and Action buttons */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm text-white truncate max-w-[180px]">
                    {empName}
                  </span>
                  {assignment.conflictWarning && (
                    <span title="Schedule conflict detected!">
                      <AlertTriangle
                        className="h-3.5 w-3.5 text-amber-400 animate-pulse flex-shrink-0"
                      />
                    </span>
                  )}
                </div>
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-semibold uppercase tracking-wider">
                    {getRoleLabel(assignment.assignmentRole)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(assignment)}
                  className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Edit Assignment"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(assignment.id, empName)}
                  className="p-1 rounded bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove Assignment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Timings and Status */}
            <div className="flex items-center justify-between text-xs text-slate-400 bg-[#090d16]/30 px-2.5 py-1.5 rounded-lg border border-slate-850/30">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>Call time:</span>
                <span className="font-mono font-medium text-slate-200">
                  {formatCallTime(assignment.callTime)}
                </span>
              </div>
              <span
                className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full border text-[9px] uppercase tracking-wider ${getStatusBadgeClass(
                  assignment.assignmentStatus
                )}`}
              >
                {assignment.assignmentStatus}
              </span>
            </div>

            {/* Notes Section */}
            {assignment.notes && (
              <div className="text-xs text-slate-400 bg-slate-900/20 px-2.5 py-2 rounded-lg border border-slate-850/40 flex items-start gap-1.5">
                <MessageSquare className="h-3 w-3 text-slate-500 mt-0.5 flex-shrink-0" />
                <span className="italic leading-normal break-words">{assignment.notes}</span>
              </div>
            )}

            {/* Conflict Alert Section */}
            {assignment.conflictWarning && conflictMsg && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Schedule Conflict Warning
                  </div>
                  <p className="text-[10px] text-amber-300/90 leading-normal break-words">
                    {conflictMsg}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
