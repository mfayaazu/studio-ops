import React from 'react';
import { Briefcase, Calendar, ClipboardCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface DashboardStatsCardsProps {
  totalProjects: number;
  upcomingEventsCount: number;
  pendingDeliverablesCount: number;
  backupIssuesCount: number;
  conflictWarningsCount: number;
  onNavigate: (route: 'projects' | 'events' | 'deliverables' | 'backups' | 'dashboard' | 'clients' | 'employees' | 'availability') => void;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({
  totalProjects,
  upcomingEventsCount,
  pendingDeliverablesCount,
  backupIssuesCount,
  conflictWarningsCount,
  onNavigate,
}) => {
  const cards = [
    {
      title: 'Active Projects',
      value: totalProjects,
      description: 'Total ongoing pipelines',
      icon: Briefcase,
      colorClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:border-indigo-500/40',
      iconColor: 'text-indigo-400',
      route: 'projects' as const,
    },
    {
      title: 'Upcoming Shoots',
      value: upcomingEventsCount,
      description: 'Scheduled shoots & events',
      icon: Calendar,
      colorClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:border-sky-500/40',
      iconColor: 'text-sky-400',
      route: 'events' as const,
    },
    {
      title: 'Pending Deliverables',
      value: pendingDeliverablesCount,
      description: 'In editing or review',
      icon: ClipboardCheck,
      colorClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20 hover:border-violet-500/40',
      iconColor: 'text-violet-400',
      route: 'deliverables' as const,
    },
    {
      title: 'Backup Risks',
      value: backupIssuesCount,
      description: 'Low redundancy or failed',
      icon: ShieldAlert,
      colorClass: backupIssuesCount > 0 
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/25 hover:border-rose-500/50' 
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40',
      iconColor: backupIssuesCount > 0 ? 'text-rose-400' : 'text-emerald-400',
      route: 'backups' as const,
    },
    {
      title: 'Schedule Conflicts',
      value: conflictWarningsCount,
      description: 'Double-booking warnings',
      icon: AlertTriangle,
      colorClass: conflictWarningsCount > 0 
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:border-amber-500/50' 
        : 'bg-slate-800/40 text-slate-400 border-slate-800/80 hover:border-slate-700',
      iconColor: conflictWarningsCount > 0 ? 'text-amber-400' : 'text-slate-400',
      route: 'availability' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <button
            key={index}
            onClick={() => onNavigate(card.route)}
            className={`flex flex-col justify-between text-left p-5 bg-[#0d1424] border rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${card.colorClass}`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg bg-slate-900/60 border border-slate-800 ${card.iconColor}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {card.value}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                {card.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
