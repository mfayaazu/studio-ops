import React, { useState } from 'react';
import type { EventAssignment } from '../types';
import type { Employee } from '../../employees/types';
import type { EventResponse } from '../../events/types';
import { AlertTriangle, Clock, MapPin, Briefcase, User, RefreshCw } from 'lucide-react';

interface AvailabilityTimelineProps {
  employees: Employee[];
  assignments: EventAssignment[];
  events: EventResponse[];
  onReassign: (assignment: EventAssignment, targetEmployee: Employee) => Promise<void>;
  onReassignError: (msg: string | null) => void;
}

const MIN_LIMIT = 6 * 60; // 06:00 in minutes
const MAX_LIMIT = 23 * 60; // 23:00 in minutes
const TOTAL_MINUTES = MAX_LIMIT - MIN_LIMIT; // 17 hours = 1020 mins

const parseTimeToMinutes = (t?: string): number => {
  if (!t) return 0;
  const parts = t.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

const formatTimeLabel = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

const getRoleLabel = (role: string): string => {
  return role.replace(/_/g, ' ');
};

export const AvailabilityTimeline: React.FC<AvailabilityTimelineProps> = ({
  employees,
  assignments,
  events,
  onReassign,
  onReassignError,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<{
    assignment: EventAssignment;
    event: EventResponse | undefined;
    employee: Employee;
    hasConflict: boolean;
  } | null>(null);

  // Drag and Drop state variables
  const [draggedAssignment, setDraggedAssignment] = useState<EventAssignment | null>(null);
  const [draggedEmployee, setDraggedEmployee] = useState<Employee | null>(null);
  const [hoveredEmployeeId, setHoveredEmployeeId] = useState<string | null>(null);
  const [pendingReassign, setPendingReassign] = useState<{
    assignment: EventAssignment;
    oldEmployee: Employee;
    newEmployee: Employee;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragStart = (e: React.DragEvent, assignment: EventAssignment, employee: Employee) => {
    setDraggedAssignment(assignment);
    setDraggedEmployee(employee);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', assignment.id);
  };

  const handleDragEnd = () => {
    setDraggedAssignment(null);
    setDraggedEmployee(null);
    setHoveredEmployeeId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetEmployee: Employee) => {
    e.preventDefault();
    if (hoveredEmployeeId !== targetEmployee.id) {
      setHoveredEmployeeId(targetEmployee.id);
    }
    const isInactive = targetEmployee.status === 'INACTIVE' || targetEmployee.status === 'ON_LEAVE';
    const isSameEmployee = draggedEmployee?.id === targetEmployee.id;
    if (isInactive || isSameEmployee) {
      e.dataTransfer.dropEffect = 'none';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent, targetEmployee: Employee) => {
    e.preventDefault();
    setHoveredEmployeeId(null);

    if (!draggedAssignment || !draggedEmployee) return;

    if (draggedEmployee.id === targetEmployee.id) {
      return;
    }

    if (targetEmployee.status === 'INACTIVE' || targetEmployee.status === 'ON_LEAVE') {
      const statusText = targetEmployee.status === 'ON_LEAVE' ? 'ON LEAVE' : 'INACTIVE';
      onReassignError(`Cannot reassign assignment: Target employee ${targetEmployee.fullName} is currently ${statusText}.`);
      return;
    }

    setPendingReassign({
      assignment: draggedAssignment,
      oldEmployee: draggedEmployee,
      newEmployee: targetEmployee,
    });
  };

  // 17 Hourly slots: 6 to 22 (representing 6-7, 7-8, ..., 22-23)
  const hourSlots = Array.from({ length: 17 }, (_, i) => 6 + i);

  return (
    <div className="space-y-4">
      <div 
        className="overflow-x-auto border border-slate-800/80 rounded-xl bg-[#0d1424] shadow-lg"
        onDragLeave={() => setHoveredEmployeeId(null)}
      >
        <div className="min-w-[1000px] divide-y divide-slate-800/60">
          
          {/* Header Row */}
          <div className="flex bg-[#090d16]/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
            {/* Employee Label Column */}
            <div className="w-56 px-4 py-3 flex-shrink-0 border-r border-slate-800/80 flex items-center bg-[#090d16]">
              Crew Member
            </div>
            
            {/* Timeline Columns */}
            <div className="flex-1 flex relative">
              {hourSlots.map((hour) => (
                <div key={hour} className="flex-1 border-r border-slate-800/40 py-3 px-1 text-center font-mono select-none">
                  {formatTimeLabel(hour)}
                </div>
              ))}
              <div className="absolute right-0 top-3 translate-x-1/2 pr-3 font-mono text-center select-none text-[10px]">
                {formatTimeLabel(23)}
              </div>
            </div>
          </div>

          {/* Employee Rows */}
          {employees.map((employee) => {
            const isInactive = employee.status === 'INACTIVE' || employee.status === 'ON_LEAVE';
            
            // Filter assignments for this employee
            const empAssignments = assignments.filter((a) => a.employeeId === employee.id);
            
            // Resolve events and calculate start/end minutes
            const resolvedBlocks = empAssignments.map((a) => {
              const event = events.find((e) => e.id === a.eventId);
              const start = parseTimeToMinutes(a.callTime || event?.startTime || '09:00');
              const end = parseTimeToMinutes(event?.endTime || '17:00');
              return {
                assignment: a,
                event,
                start,
                end,
                hasConflict: false,
              };
            });

            // Calculate overlapping conflicts
            for (let i = 0; i < resolvedBlocks.length; i++) {
              for (let j = i + 1; j < resolvedBlocks.length; j++) {
                const a = resolvedBlocks[i];
                const b = resolvedBlocks[j];
                // Overlap formula: startA < endB && startB < endA
                if (a.start < b.end && b.start < a.end) {
                  a.hasConflict = true;
                  b.hasConflict = true;
                }
              }
            }

            const isHovered = hoveredEmployeeId === employee.id;
            const isSameEmployee = draggedEmployee?.id === employee.id;
            const isInvalidDrop = isInactive || isSameEmployee;

            let dragHoverClass = '';
            if (draggedAssignment && isHovered) {
              if (isInvalidDrop) {
                dragHoverClass = 'bg-rose-950/20 outline outline-2 outline-dashed outline-rose-500/40 cursor-not-allowed';
              } else {
                dragHoverClass = 'bg-indigo-950/25 outline outline-2 outline-dashed outline-indigo-500/60';
              }
            }

            return (
              <div
                key={employee.id}
                onDragOver={(e) => handleDragOver(e, employee)}
                onDrop={(e) => handleDrop(e, employee)}
                className={`flex hover:bg-slate-900/10 transition-all ${
                  isInactive ? 'bg-slate-950/20' : ''
                } ${dragHoverClass}`}
              >
                {/* Employee card cell */}
                <div className="w-56 p-4 flex-shrink-0 border-r border-slate-800/80 flex flex-col justify-center space-y-1 bg-[#0d1424] z-[2]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-sm text-white truncate">
                      {employee.fullName}
                    </span>
                    {employee.status === 'ON_LEAVE' && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-bold uppercase shrink-0">
                        Leave
                      </span>
                    )}
                    {employee.status === 'INACTIVE' && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-bold uppercase shrink-0">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium truncate">
                    {getRoleLabel(employee.primaryRole)}
                  </div>
                </div>

                {/* Grid Timeline Cell */}
                <div 
                  className="flex-1 relative min-h-[56px] flex items-center"
                  style={
                    isInactive
                      ? {
                          backgroundImage: 'linear-gradient(45deg, #0f172a 25%, transparent 25%, transparent 50%, #0f172a 50%, #0f172a 75%, transparent 75%, transparent)',
                          backgroundSize: '12px 12px',
                          opacity: 0.65
                        }
                      : {}
                  }
                >
                  {/* Background Grid Lines */}
                  <div className="grid grid-cols-17 h-full absolute inset-0 pointer-events-none">
                    {hourSlots.map((hour) => (
                      <div key={hour} className="border-r border-slate-800/20 last:border-r-0 h-full" />
                    ))}
                  </div>

                  {/* Render Booked Assignment Blocks */}
                  {!isInactive &&
                    resolvedBlocks.map(({ assignment, event, start, end, hasConflict }) => {
                      // Cap positioning boundaries within 06:00 to 23:00
                      const blockStart = Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, start));
                      const blockEnd = Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, end));
                      
                      let duration = blockEnd - blockStart;
                      if (duration <= 0) duration = 60; // fallback to minimum 1 hour block height

                      const leftPercent = ((blockStart - MIN_LIMIT) / TOTAL_MINUTES) * 100;
                      const widthPercent = (duration / TOTAL_MINUTES) * 100;

                      const isConflictBlock = hasConflict || assignment.conflictWarning;
                      const isBeingDragged = draggedAssignment?.id === assignment.id;

                      return (
                        <button
                          key={assignment.id}
                          type="button"
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, assignment, employee)}
                          onDragEnd={handleDragEnd}
                          onClick={() =>
                            setSelectedBlock({
                              assignment,
                              event,
                              employee,
                              hasConflict: isConflictBlock,
                            })
                          }
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          className={`absolute h-9 py-1 px-2.5 rounded-lg border text-left flex flex-col justify-center gap-0.5 select-none transition-all hover:scale-[1.01] hover:shadow-lg cursor-grab active:cursor-grabbing ${
                            isConflictBlock
                              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200 hover:bg-rose-900/50 shadow-rose-950/20'
                              : 'bg-violet-950/30 border-violet-500/30 text-violet-200 hover:bg-violet-900/30 shadow-violet-950/25'
                          } ${isBeingDragged ? 'opacity-30 border-dashed border-violet-500 shadow-none scale-100' : ''}`}
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            {isConflictBlock && (
                              <AlertTriangle className="h-3 w-3 text-rose-400 animate-pulse flex-shrink-0" />
                            )}
                            <span className="font-bold text-[10px] tracking-wide truncate">
                              {event?.title || 'Untitled Event'}
                            </span>
                          </div>
                          <span className="text-[9px] opacity-75 font-mono tracking-tight truncate">
                            {assignment.callTime?.substring(0, 5) || event?.startTime?.substring(0, 5)} - {event?.endTime?.substring(0, 5)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Booking details Modal Popover */}
      {selectedBlock && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedBlock(null)}
        >
          <div 
            className="bg-[#0d1424] border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popover Header */}
            <div className="flex justify-between items-start gap-4 border-b border-slate-850 pb-3">
              <div className="min-w-0 space-y-0.5">
                <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] font-bold uppercase tracking-wider">
                  Assignment Detail
                </span>
                <h4 className="text-white font-bold text-base leading-snug truncate mt-1">
                  {selectedBlock.event?.title || 'Unknown Event'}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedBlock(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Conflict details block */}
            {selectedBlock.hasConflict && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2 text-xs">
                <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0 animate-pulse" />
                <div className="space-y-0.5">
                  <div className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">
                    Overlap Conflict Detected
                  </div>
                  <p className="text-rose-300 leading-normal">
                    {selectedBlock.assignment.conflictReason || 
                     selectedBlock.assignment.conflictMessage || 
                     'This crew member has another event assignment scheduled overlapping in time on this date.'}
                  </p>
                </div>
              </div>
            )}

            {/* Crew Member Assigned details */}
            <div className="space-y-3.5 text-sm text-slate-350">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-violet-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Crew Member</span>
                  <span className="text-slate-200 font-semibold">{selectedBlock.employee.fullName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-violet-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Assigned Role</span>
                  <span className="text-slate-200">{getRoleLabel(selectedBlock.assignment.assignmentRole)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-violet-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Schedule timings</span>
                  <div className="text-slate-200 font-mono text-xs mt-0.5">
                    Call: <span className="font-semibold text-slate-100">{selectedBlock.assignment.callTime?.substring(0, 5) || 'N/A'}</span> • Event: <span className="font-semibold text-slate-100">{selectedBlock.event?.startTime?.substring(0, 5) || 'N/A'} - {selectedBlock.event?.endTime?.substring(0, 5) || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedBlock.event?.venueName && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-violet-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Location / Venue</span>
                    <span className="text-slate-200">
                      {selectedBlock.event.venueName} {selectedBlock.event.city && `(${selectedBlock.event.city})`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {selectedBlock.assignment.notes && (
              <div className="bg-[#090d16]/30 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Coordination Notes</span>
                <p className="text-slate-300 italic leading-relaxed break-words">{selectedBlock.assignment.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-850 flex">
              <button
                type="button"
                onClick={() => setSelectedBlock(null)}
                className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Dialog for Drag and Drop Reassignment */}
      {pendingReassign && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            if (!isProcessing) setPendingReassign(null);
          }}
        >
          <div 
            className="bg-[#0d1424] border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popover Header */}
            <div className="flex justify-between items-start gap-4 border-b border-slate-850 pb-3">
              <div className="min-w-0 space-y-0.5">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase tracking-wider">
                  Reassign Crew Member
                </span>
                <h4 className="text-white font-bold text-base leading-snug truncate mt-1">
                  Confirm Crew Swap
                </h4>
              </div>
              <button 
                onClick={() => {
                  if (!isProcessing) setPendingReassign(null);
                }}
                disabled={isProcessing}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 transition-colors cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-350 leading-relaxed">
              Reassign this crew assignment from <strong className="text-white font-semibold">{pendingReassign.oldEmployee.fullName}</strong> to <strong className="text-white font-semibold">{pendingReassign.newEmployee.fullName}</strong>?
            </p>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-850 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingReassign(null)}
                disabled={isProcessing}
                className="w-1/2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-350 hover:text-white text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    await onReassign(pendingReassign.assignment, pendingReassign.newEmployee);
                    setPendingReassign(null);
                  } catch (err) {
                    // error handled in parent
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Swap</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
