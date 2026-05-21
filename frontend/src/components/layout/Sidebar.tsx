import { useRouter } from '../../app/router';
import type { AppRoute } from '../../app/router';

import {
  Activity,
  Users,
  Briefcase,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList,
  Clock,
  Database
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { APP_VERSION } from '../../lib/constants';

export const Sidebar: React.FC = () => {
  const { currentRoute, navigateTo } = useRouter();

  const navItems = [
    { id: 'dashboard' as AppRoute, label: 'Dashboard', icon: Activity },
    { id: 'clients' as AppRoute, label: 'Clients', icon: Users },
    { id: 'projects' as AppRoute, label: 'Projects', icon: Briefcase },
    { id: 'employees' as AppRoute, label: 'Employees', icon: ClipboardList },
    { id: 'events' as AppRoute, label: 'Events Calendar', icon: Calendar },
    { id: 'availability' as AppRoute, label: 'Availability', icon: Clock },
    { id: 'deliverables' as AppRoute, label: 'Deliverables', icon: Layers },
    { id: 'backups' as AppRoute, label: 'Backup Center', icon: Database },
  ];

  return (
    <aside className="w-64 bg-[#0d1424] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Layers className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-heading font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200 tracking-wide">
            StudioOps
          </span>
          <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full font-mono ml-auto">
            MVP
          </span>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-fuchsia-500/10 border-l-2 border-violet-500 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-2 border-transparent"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 transition-colors", isActive ? "text-violet-400" : "text-slate-400")} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1.5">
        <div className="flex items-center gap-1 text-slate-400 font-medium">
          <Sparkles className="h-3 w-3 text-fuchsia-400" />
          <span>Internal Admin Console</span>
        </div>
        <div className="flex justify-between font-mono text-[10px]">
          <span>Version:</span>
          <span>{APP_VERSION}</span>
        </div>
      </div>
    </aside>
  );
};
