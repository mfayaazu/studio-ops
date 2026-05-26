import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { Clock, LogOut, Layers, Loader2 } from 'lucide-react';

export const PendingApprovalPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      console.error('Failed to log out:', e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients for premium aesthetic */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0d1424] border border-slate-800/80 rounded-2xl shadow-2xl relative z-10 overflow-hidden">
        {/* Glow accent line at top */}
        <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-500 w-full" />

        <div className="p-8 text-center space-y-6">
          {/* Logo Header */}
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-4">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-heading font-bold text-white tracking-wide">
              StudioOps Beta
            </h1>
            <p className="text-slate-455 text-xs mt-1">
              Workspace Onboarding Setup
            </p>
          </div>

          {/* Pending Alert Card */}
          <div className="bg-[#1e1c18]/30 border border-amber-500/20 rounded-2xl p-6 flex flex-col items-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-amber-400 font-mono tracking-wide">
                APPROVAL PENDING
              </h2>
              <p className="text-xs text-slate-350 leading-relaxed font-sans px-2">
                Your beta workspace request for <strong className="text-slate-200">{user?.studioName || 'your studio'}</strong> is currently pending manual authorization.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            Once approved, you will be able to access the operational workspace dashboard directly. Please contact our support if you believe this is an error.
          </p>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full bg-[#090d16] hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-750 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out of Account</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
