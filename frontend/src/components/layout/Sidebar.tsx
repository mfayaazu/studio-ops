import React from 'react';
import { useRouter } from '../../app/router';
import type { AppRoute } from '../../app/router';
import { useAuth } from '../../features/auth/AuthProvider';
import { canAccessRoute } from '../../features/auth/permissions';

import {
  Activity,
  Users,
  Briefcase,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList,
  Clock,
  Database,
  MessageSquare,
  LayoutGrid,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { APP_VERSION } from '../../lib/constants';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { currentRoute, navigateTo } = useRouter();
  const { user, permissions } = useAuth();

  const navItems = [
    { id: 'dashboard' as AppRoute, label: 'Dashboard', icon: Activity },
    { id: 'clients' as AppRoute, label: 'Clients', icon: Users },
    { id: 'projects' as AppRoute, label: 'Projects', icon: Briefcase },
    { id: 'employees' as AppRoute, label: 'Employees', icon: ClipboardList },
    { id: 'events' as AppRoute, label: 'Events Calendar', icon: Calendar },
    { id: 'availability' as AppRoute, label: 'Availability', icon: Clock },
    { id: 'deliverables' as AppRoute, label: 'Deliverables', icon: Layers },
    { id: 'backups' as AppRoute, label: 'Backup Center', icon: Database },
    { id: 'follow-up-center' as AppRoute, label: 'Follow-up Center', icon: MessageSquare },
    { id: 'post-production' as AppRoute, label: 'Post Production', icon: LayoutGrid },
    { id: 'quotations' as AppRoute, label: 'Quotations', icon: FileText },
  ];

  const allowedNavItems = navItems.filter(item => canAccessRoute(user?.role || 'EMPLOYEE', item.id, permissions));

  return (
    <aside className={cn(
      "bg-[#0d1424] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 ease-in-out z-30",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div>
        {/* Brand Header */}
        <div className={cn(
          "h-16 flex items-center px-4 border-b border-slate-800/80 justify-between",
          isCollapsed ? "justify-center" : "px-6"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
              <Layers className="h-4.5 w-4.5 text-white" />
            </div>
            {!isCollapsed && (
              <>
                <span className="font-heading font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200 tracking-wide">
                  StudioOps
                </span>
                <span className="text-[9px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full font-mono">
                  MVP
                </span>
              </>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed toggle button when sidebar is collapsed */}
        {isCollapsed && (
          <div className="flex justify-center py-2 border-b border-slate-800/40">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5">
          {!isCollapsed && (
            <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Workspace
            </div>
          )}

          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={cn(
                  "w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 border-l-2",
                  isCollapsed ? "justify-center p-2.5" : "px-4 py-2.5 gap-3",
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-fuchsia-500/10 border-violet-500 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-4.5 w-4.5 transition-colors flex-shrink-0", isActive ? "text-violet-400" : "text-slate-400")} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-1.5">
        <div className="text-[11px] text-slate-500 space-y-1.5 px-1">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-1 text-slate-400 font-medium">
                <Sparkles className="h-3 w-3 text-fuchsia-400" />
                <span>Internal Admin Console</span>
              </div>
              <div className="flex justify-between font-mono text-[9px]">
                <span>Version:</span>
                <span>{APP_VERSION}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-center text-slate-500 hover:text-slate-350 cursor-help" title={`Version: ${APP_VERSION}`}>
              <Sparkles className="h-4 w-4 text-fuchsia-400" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
