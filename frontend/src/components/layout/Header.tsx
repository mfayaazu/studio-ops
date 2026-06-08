import React, { useState, useEffect, useRef } from 'react';
import { Clock, Server, RefreshCw, ChevronDown, User, LogOut, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../features/auth/AuthProvider';
import { useRouter } from '../../app/router';

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
  const { user, logout } = useAuth();
  const { navigateTo } = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timeString = new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'US';
  };

  const handleMyAccountClick = () => {
    setIsDropdownOpen(false);
    navigateTo('my-account');
  };

  const handleSignOutClick = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0d1424]/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
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

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{timeString}</span>
        </div>

        {/* User Account Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 hover:bg-slate-850/60 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-800/80"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-violet-650 to-fuchsia-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-violet-550/10 border border-violet-500/20">
                {getInitials(user.displayName, user.email)}
              </div>
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.displayName || user.email}
                </span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">
                  {user.role}
                </span>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-slate-500 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0d1424] border border-slate-800/90 shadow-2xl py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header info */}
                <div className="px-4 py-2 border-b border-slate-800/80 mb-1">
                  <span className="text-xs font-semibold text-slate-200 block truncate">
                    {user.displayName || 'No Name'}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {user.email}
                  </span>
                  {user.studioName && (
                    <span className="text-[9px] text-violet-400 font-medium bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full inline-block mt-1.5 uppercase font-mono">
                      {user.studioName}
                    </span>
                  )}
                </div>

                {/* My Account Route Action */}
                <button
                  onClick={handleMyAccountClick}
                  className="w-full text-left px-4 py-2 text-xs text-slate-350 hover:text-white hover:bg-slate-800/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4 text-slate-450" />
                  <span>My Account</span>
                </button>

                {user.isPlatformAdmin && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigateTo('platform-admin');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-350 hover:text-white hover:bg-slate-800/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Shield className="h-4 w-4 text-slate-450" />
                    <span>Platform Admin</span>
                  </button>
                )}

                {/* Sign Out Action */}
                <button
                  onClick={handleSignOutClick}
                  className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-800/50 mt-1 pt-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
