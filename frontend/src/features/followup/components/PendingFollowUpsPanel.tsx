import React, { useState, useEffect } from 'react';
import type { PendingFollowUp, FollowUpTask, CommunicationLog } from '../types';
import { approveFollowUpTask, skipFollowUpTask } from '../api/followupApi';
import { mockLeads } from '../mockData';
import { Mail, MessageSquare, Phone, Smartphone, Check, X, Eye, ShieldAlert, Sparkles, RefreshCw, Loader2 } from 'lucide-react';

interface PendingFollowUpsPanelProps {
  initialTasks: PendingFollowUp[];
  backendTasks?: FollowUpTask[];
  communicationLogs?: CommunicationLog[];
  isBackendMode: boolean;
  onActionSuccess?: () => void;
}

interface UnifiedTask {
  id: string;
  isBackend: boolean;
  clientName: string;
  projectTitle: string;
  channel: string;
  dueDate: string;
  dueStatus: 'due_today' | 'overdue' | 'upcoming';
  subject?: string;
  body: string;
}

const resolveClientAndProject = (task: FollowUpTask) => {
  const matchedLead = mockLeads.find(lead => 
    lead.id === task.clientId || 
    lead.id === task.projectId ||
    lead.clientName.toLowerCase() === task.recipient?.toLowerCase()
  );
  if (matchedLead) {
    return {
      clientName: matchedLead.clientName,
      projectTitle: matchedLead.projectTitle
    };
  }
  return {
    clientName: task.recipient || 'Unknown Client',
    projectTitle: task.subject || 'Standalone Follow-up'
  };
};

const getDueStatus = (scheduledAt: string): 'due_today' | 'overdue' | 'upcoming' => {
  const scheduledDate = new Date(scheduledAt);
  const today = new Date();
  const scheduledZero = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffTime = scheduledZero.getTime() - todayZero.getTime();
  if (diffTime < 0) {
    return 'overdue';
  } else if (diffTime === 0) {
    return 'due_today';
  } else {
    return 'upcoming';
  }
};

const mapBackendTask = (task: FollowUpTask): UnifiedTask => {
  const resolved = resolveClientAndProject(task);
  return {
    id: task.id,
    isBackend: true,
    clientName: resolved.clientName,
    projectTitle: resolved.projectTitle,
    channel: task.channel,
    dueDate: new Date(task.scheduledAt).toLocaleDateString(),
    dueStatus: getDueStatus(task.scheduledAt),
    subject: task.subject,
    body: task.messageBody
  };
};

const mapMockTask = (task: PendingFollowUp): UnifiedTask => {
  return {
    id: task.id,
    isBackend: false,
    clientName: task.clientName,
    projectTitle: task.projectTitle,
    channel: task.channel,
    dueDate: task.dueDate,
    dueStatus: task.dueStatus,
    subject: task.subject,
    body: task.body
  };
};

export const PendingFollowUpsPanel: React.FC<PendingFollowUpsPanelProps> = ({
  initialTasks,
  backendTasks,
  communicationLogs,
  isBackendMode,
  onActionSuccess
}) => {
  const [mockTasks, setMockTasks] = useState<PendingFollowUp[]>(initialTasks);
  const [localLogs, setLocalLogs] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state if initialTasks change
  useEffect(() => {
    if (!isBackendMode) {
      setMockTasks(initialTasks);
    }
  }, [initialTasks, isBackendMode]);

  const tasksToRender = isBackendMode 
    ? (backendTasks || []).map(mapBackendTask)
    : mockTasks.map(mapMockTask);

  const selectedTask = tasksToRender.find(t => t.id === selectedTaskId) || null;

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="h-3.5 w-3.5" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-3.5 w-3.5" />;
      case 'SMS':
        return <Smartphone className="h-3.5 w-3.5" />;
      case 'MANUAL_CALL':
        return <Phone className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const getDueBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'due_today':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'upcoming':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700/50';
    }
  };

  const handleAction = async (task: UnifiedTask, action: 'approved' | 'skipped') => {
    setActionLoadingId(task.id);
    setActionStatus(null);
    try {
      if (task.isBackend) {
        if (action === 'approved') {
          await approveFollowUpTask(task.id);
          setActionStatus({ type: 'success', message: `✓ Task approved & logged as SENT for ${task.clientName}` });
        } else {
          await skipFollowUpTask(task.id);
          setActionStatus({ type: 'success', message: `✗ Task skipped & logged as SKIPPED for ${task.clientName}` });
        }
        
        if (selectedTaskId === task.id) {
          setSelectedTaskId(null);
        }

        // Notify parent to reload lists
        if (onActionSuccess) {
          onActionSuccess();
        }
      } else {
        // Mock UI behavior
        setMockTasks(prev => prev.filter(t => t.id !== task.id));
        if (selectedTaskId === task.id) {
          setSelectedTaskId(null);
        }
        const logMsg = action === 'approved' 
          ? `✓ Follow-up approved & dispatched to ${task.clientName}`
          : `✗ Follow-up step skipped for ${task.clientName}`;
        setLocalLogs(prev => [logMsg, ...prev]);
        setActionStatus({ type: 'success', message: logMsg });
      }
    } catch (err: any) {
      console.error(err);
      setActionStatus({ 
        type: 'error', 
        message: `Failed to ${action === 'approved' ? 'approve' : 'skip'} task: ${err.message || 'Unknown error'}` 
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReset = () => {
    setMockTasks(initialTasks);
    setLocalLogs([]);
    setSelectedTaskId(null);
    setActionStatus(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0b1222]/50 border border-slate-800/60 rounded-2xl p-5 shadow-xl flex flex-col space-y-5">
        {/* Panel Header */}
        <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
              <span>Pending Approvals Gate</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Manual approval checklist before message transmission
            </p>
          </div>
          {!isBackendMode && (mockTasks.length < initialTasks.length || localLogs.length > 0) && (
            <button 
              onClick={handleReset}
              title="Reset Mock Tasks"
              className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Success/Error Action Toast messages */}
        {actionStatus && (
          <div className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between ${
            actionStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
          }`}>
            <span>{actionStatus.message}</span>
            <button onClick={() => setActionStatus(null)} className="text-[10px] hover:underline uppercase ml-2">Dismiss</button>
          </div>
        )}

        {/* Main split: Task List & Detail Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Side: Tasks List */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {tasksToRender.length === 0 ? (
              <div className="border border-dashed border-slate-800/50 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-2">
                <Check className="h-8 w-8 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-1.5 rounded-full" />
                <span className="text-xs font-semibold text-slate-350">All Cleared!</span>
                <p className="text-[10px] text-slate-500 max-w-[200px]">No pending communication tasks require approval.</p>
              </div>
            ) : (
              tasksToRender.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`border rounded-xl p-3.5 transition-all duration-200 cursor-pointer space-y-3 relative overflow-hidden ${
                    selectedTaskId === task.id
                      ? 'bg-slate-900 border-violet-500/50 shadow-lg shadow-violet-500/5'
                      : 'bg-[#0f172a]/80 border-slate-850 hover:border-slate-800 hover:bg-slate-900/40'
                  }`}
                >
                  {actionLoadingId === task.id && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center z-10">
                      <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                    </div>
                  )}
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-250 text-xs truncate">{task.clientName}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{task.projectTitle}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${getDueBadge(task.dueStatus)}`}>
                      {task.dueStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded font-bold font-mono">
                      {getChannelIcon(task.channel)}
                      <span>{task.channel}</span>
                    </span>
                    <span>Due: {task.dueDate}</span>
                  </div>

                  {/* CTA actions */}
                  <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-800/40">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskId(task.id);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-lg transition-colors"
                      title="Preview Draft"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(task, 'skipped');
                      }}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 rounded-lg transition-colors"
                      title="Skip Step"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(task, 'approved');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded-lg font-bold text-[10px] transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Side: Message Preview Pane */}
          <div className="border border-slate-850 bg-[#0c1322] rounded-xl p-4.5 flex flex-col justify-between min-h-[300px] relative">
            {selectedTask && actionLoadingId === selectedTask.id && (
              <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center z-10 rounded-xl">
                <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
              </div>
            )}
            {selectedTask ? (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300">Message Draft Preview</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">ID: {selectedTask.id}</span>
                  </div>
                  
                  {selectedTask.subject && (
                    <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg text-xs">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase mb-0.5">Subject:</span>
                      <span className="text-slate-200 font-medium">{selectedTask.subject}</span>
                    </div>
                  )}

                  <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-xs font-medium flex-1">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase mb-1">Body:</span>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                      {selectedTask.body}
                    </p>
                  </div>

                  <div className="text-[10px] text-amber-400/80 bg-amber-500/5 border border-amber-500/10 px-2 py-1 rounded flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0 text-amber-450" />
                    <span>Manual demo send — logged only</span>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-slate-800 pt-3">
                  <button
                    onClick={() => handleAction(selectedTask, 'skipped')}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs transition-colors"
                  >
                    Skip Step
                  </button>
                  <button
                    onClick={() => handleAction(selectedTask, 'approved')}
                    className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white rounded-lg font-bold text-xs transition-colors shadow-md"
                  >
                    Approve & Dispatch
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full space-y-2 opacity-50 py-12">
                <Eye className="h-10 w-10 text-slate-600" />
                <span className="text-xs font-semibold text-slate-400">Select a Task to Preview</span>
                <p className="text-[10px] text-slate-650 max-w-[220px]">
                  Click on any follow-up card on the left to see the message subject and body drafts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch History Logs */}
      <div className="bg-[#0b1222]/50 border border-slate-800/60 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-fuchsia-400" />
              <span>Recent Communication Logs</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Audit trail of dispatches and workflow skips
            </p>
          </div>
        </div>

        {isBackendMode && communicationLogs && communicationLogs.length > 0 ? (
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {communicationLogs.map((log) => {
              const matchedLead = mockLeads.find(l => l.id === log.clientId || l.id === log.projectId);
              const displayName = matchedLead ? matchedLead.clientName : (log.recipient || 'Client');
              const projectTitle = matchedLead ? matchedLead.projectTitle : (log.subject || 'Follow-up Task');

              return (
                <div 
                  key={log.id} 
                  className="text-[11px] font-mono border border-slate-850 bg-slate-900/40 rounded-xl p-3.5 flex justify-between items-start gap-4 transition-all hover:bg-slate-900/80"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-250 text-xs">{displayName}</span>
                      <span className="text-slate-500 text-[10px]">• {log.channel}</span>
                      <span className="text-[9px] bg-slate-800 border border-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded font-bold">{log.provider || 'MANUAL_DEMO'}</span>
                    </div>
                    {projectTitle && <div className="text-slate-400 text-[10px] truncate">Context: {projectTitle}</div>}
                    {log.messageBody && <div className="text-slate-400 max-w-2xl truncate">Body: {log.messageBody}</div>}
                    <div className="text-[9px] text-slate-500">
                      ID: {log.id} • Registered: {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase flex-shrink-0 ${
                    log.status === 'SENT' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : log.status === 'SKIPPED'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {log.status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : !isBackendMode && localLogs.length > 0 ? (
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {localLogs.map((logMsg, idx) => (
              <div key={idx} className="text-[10px] font-mono border border-slate-850 bg-slate-900/40 rounded-lg p-2 flex items-center gap-2 text-emerald-400">
                <Sparkles className="h-3 w-3 text-fuchsia-400 flex-shrink-0" />
                <span>{logMsg}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-800/40 rounded-xl py-6 text-center text-slate-500 text-[11px] font-mono">
            No communication logs registered. Approved or skipped items will appear here.
          </div>
        )}
      </div>
    </div>
  );
};
