import React, { useState } from 'react';
import type { PendingFollowUp } from '../types';
import { Mail, MessageSquare, Phone, Smartphone, Check, X, Eye, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface PendingFollowUpsPanelProps {
  initialTasks: PendingFollowUp[];
}

export const PendingFollowUpsPanel: React.FC<PendingFollowUpsPanelProps> = ({ initialTasks }) => {
  const [tasks, setTasks] = useState<PendingFollowUp[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<PendingFollowUp | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

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

  const handleAction = (taskId: string, client: string, action: 'approved' | 'skipped') => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    const logMsg = action === 'approved' 
      ? `✓ Follow-up approved & dispatched to ${client}`
      : `✗ Follow-up step skipped for ${client}`;
    setLogs([logMsg, ...logs]);
  };

  const handleReset = () => {
    setTasks(initialTasks);
    setLogs([]);
    setSelectedTask(null);
  };

  return (
    <div className="bg-[#0b1222]/50 border border-slate-800/60 rounded-2xl p-5 shadow-xl flex flex-col h-full space-y-5">
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
        {(tasks.length < initialTasks.length || logs.length > 0) && (
          <button 
            onClick={handleReset}
            title="Reset Mock Tasks"
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Main split: Task List & Detail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left Side: Tasks List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="border border-dashed border-slate-800/50 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-2">
              <Check className="h-8 w-8 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-1.5 rounded-full" />
              <span className="text-xs font-semibold text-slate-350">All Cleared!</span>
              <p className="text-[10px] text-slate-500 max-w-[200px]">No pending communication tasks require approval.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`border rounded-xl p-3.5 transition-all duration-200 cursor-pointer space-y-3 relative overflow-hidden ${
                  selectedTask?.id === task.id
                    ? 'bg-slate-900 border-violet-500/50 shadow-lg shadow-violet-500/5'
                    : 'bg-[#0f172a]/80 border-slate-850 hover:border-slate-800 hover:bg-slate-900/40'
                }`}
              >
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
                      setSelectedTask(task);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-lg transition-colors"
                    title="Preview Draft"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(task.id, task.clientName, 'skipped');
                    }}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 rounded-lg transition-colors"
                    title="Skip Step"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(task.id, task.clientName, 'approved');
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
        <div className="border border-slate-850 bg-[#0c1322] rounded-xl p-4.5 flex flex-col justify-between min-h-[300px]">
          {selectedTask ? (
            <div className="space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-300">Message Draft Preview</span>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {selectedTask.id}</span>
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
              </div>

              <div className="flex gap-2 border-t border-slate-800 pt-3">
                <button
                  onClick={() => handleAction(selectedTask.id, selectedTask.clientName, 'skipped')}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs transition-colors"
                >
                  Skip Step
                </button>
                <button
                  onClick={() => handleAction(selectedTask.id, selectedTask.clientName, 'approved')}
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

      {/* Simulated Logs Feed */}
      {logs.length > 0 && (
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-3.5 space-y-2 max-h-[120px] overflow-y-auto">
          <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wide">System Logs Feed:</span>
          <div className="space-y-1 font-mono text-[10px]">
            {logs.map((log, idx) => (
              <div key={idx} className="text-emerald-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-fuchsia-400" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
