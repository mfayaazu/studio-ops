import React from 'react';
import { Users, Briefcase, Calendar, ClipboardCheck, Database, Sliders, Contact } from 'lucide-react';
import type { AppRoute } from '../../../app/router';

interface QuickActionsPanelProps {
  onNavigate: (route: AppRoute) => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ onNavigate }) => {
  const actions = [
    {
      title: 'Clients Hub',
      description: 'Manage client accounts, contact details & contracts',
      icon: Users,
      route: 'clients' as const,
      color: 'from-violet-500/10 to-indigo-500/10 text-indigo-400 hover:border-indigo-500/40',
    },
    {
      title: 'Projects Board',
      description: 'Pipeline of active photo/video project workflows',
      icon: Briefcase,
      route: 'projects' as const,
      color: 'from-sky-500/10 to-blue-500/10 text-sky-400 hover:border-sky-500/40',
    },
    {
      title: 'Events Calendar',
      description: 'Monthly schedule of events, times & venues',
      icon: Calendar,
      route: 'events' as const,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-400 hover:border-emerald-500/40',
    },
    {
      title: 'Availability Planner',
      description: 'Outlook-style crew schedule and allocations',
      icon: Sliders,
      route: 'availability' as const,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-400 hover:border-amber-500/40',
    },
    {
      title: 'Deliverables',
      description: 'Milestone tracking for post-production editing',
      icon: ClipboardCheck,
      route: 'deliverables' as const,
      color: 'from-fuchsia-500/10 to-pink-500/10 text-fuchsia-400 hover:border-fuchsia-500/40',
    },
    {
      title: 'Backup Center',
      description: 'Data redundancy checks & cloud safety dashboard',
      icon: Database,
      route: 'backups' as const,
      color: 'from-rose-500/10 to-red-500/10 text-rose-400 hover:border-rose-500/40',
    },
    {
      title: 'Employee Registry',
      description: 'Manage photographers, editors & assistants',
      icon: Contact,
      route: 'employees' as const,
      color: 'from-teal-500/10 to-cyan-500/10 text-teal-400 hover:border-teal-500/40',
    },
  ];

  return (
    <section className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
      <div>
        <h3 className="text-white font-medium text-base">Quick Operations Hub</h3>
        <p className="text-slate-500 text-xs mt-0.5">Quickly navigate to different StudioOps feature views</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <button
              key={index}
              onClick={() => onNavigate(act.route)}
              className={`group relative p-5 bg-[#0d1424] border border-slate-800/80 rounded-xl text-left shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${act.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg group-hover:border-slate-700 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <h4 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                  {act.title}
                </h4>
                <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">
                  {act.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
