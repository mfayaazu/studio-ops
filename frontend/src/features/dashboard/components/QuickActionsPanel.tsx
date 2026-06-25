import React from 'react';
import { Users, Briefcase, ClipboardList, Layers, MessageSquare } from 'lucide-react';
import type { AppRoute } from '../../../app/router';

interface QuickActionsPanelProps {
  onNavigate: (route: AppRoute) => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ onNavigate }) => {
  const actions = [
    {
      title: 'Add Inquiry',
      description: 'Register a new customer inquiry, lead, or quote request.',
      icon: MessageSquare,
      route: 'follow-up-center' as const,
      color: 'from-violet-500/10 to-indigo-500/10 text-indigo-400 border-indigo-500/25 hover:border-indigo-500/50',
    },
    {
      title: 'Create Booking',
      description: 'Open the guided booking wizard to set up a new shoot event.',
      icon: Briefcase,
      route: 'projects' as const,
      color: 'from-sky-500/10 to-blue-500/10 text-sky-400 border-sky-500/25 hover:border-sky-500/50',
    },
    {
      title: 'Add Client',
      description: 'Create a client account for contact, billing & contracts.',
      icon: Users,
      route: 'clients' as const,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/25 hover:border-emerald-500/50',
    },
    {
      title: 'Add Team Member',
      description: 'Add photographers, editors, or other studio staff.',
      icon: ClipboardList,
      route: 'employees' as const,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/25 hover:border-amber-500/50',
    },
    {
      title: 'Add Delivery Item',
      description: 'Create deliverables like photos, teaser videos, or albums.',
      icon: Layers,
      route: 'deliverables' as const,
      color: 'from-fuchsia-500/10 to-pink-500/10 text-fuchsia-400 border-fuchsia-500/25 hover:border-fuchsia-500/50',
    },
  ];

  return (
    <section className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
      <div>
        <h3 className="text-white font-medium text-base">Quick Operations Hub</h3>
        <p className="text-slate-500 text-xs mt-0.5">Quickly jump to sections to add records and manage workflows</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <button
              key={index}
              onClick={() => onNavigate(act.route)}
              className={`group relative p-5 bg-[#0d1424] border border-slate-800/80 rounded-xl text-left shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${act.color} cursor-pointer`}
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
