import React from 'react';
import { Clock, Server, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeaderProps {
  apiStatus: 'online' | 'connecting' | 'offline';
  latency: number | null;
  onRefreshHealth: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  apiStatus,
  latency,
  onRefreshHealth,
  isRefreshing,
}) => {
  const timeString = new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0d1424]/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
          Studio Operations Sandbox
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* API connection indicator */}
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 px-4 py-1.5 rounded-full text-xs">
          <div className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">API Server:</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono uppercase font-semibold",
                apiStatus === 'online' && "text-emerald-400",
                apiStatus === 'connecting' && "text-slate-400",
                apiStatus === 'offline' && "text-rose-400"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  apiStatus === 'online' && "bg-emerald-400 animate-pulse",
                  apiStatus === 'connecting' && "bg-slate-400 animate-ping",
                  apiStatus === 'offline' && "bg-rose-400 animate-pulse"
                )}
              />
              {apiStatus}
            </span>
          </div>

          {latency !== null && (
            <span className="text-slate-500 border-l border-slate-800 pl-2">
              {latency}ms
            </span>
          )}

          <button
            onClick={onRefreshHealth}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer pl-1"
            title="Recheck Gateway Health"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{timeString}</span>
        </div>
      </div>
    </header>
  );
};
