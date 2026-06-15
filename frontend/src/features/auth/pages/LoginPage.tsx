import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { Mail, Lock, AlertTriangle, Layers, Loader2 } from 'lucide-react';
import { RegisterPage } from './RegisterPage';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  if (isRegistering) {
    return <RegisterPage onBackToLogin={() => setIsRegistering(false)} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    // Frontend validation
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }
    if (!password) {
      setValidationError('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      // Extract clean error message from ApiError or standard Error
      const message = err.message || 'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to prefill dev credentials
  const handleFillDevCredentials = () => {
    setEmail('owner@studioops.local');
    setPassword('ChangeMe123!');
    setValidationError(null);
    setError(null);
  };

  const displayedError = validationError || error;

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients for premium aesthetic */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0d1424] border border-slate-800/80 rounded-2xl shadow-2xl relative z-10 overflow-hidden">
        {/* Glow accent line at top */}
        <div className="h-1 bg-gradient-to-r from-violet-600 to-fuchsia-500 w-full" />

        <div className="p-8">
          {/* Brand Logo Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-4">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white tracking-wide">
              StudioOps
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Photography Operations Management System
            </p>
          </div>

          {/* Form Error Banner */}
          {displayedError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs flex items-start gap-2.5 mb-6 transition-all duration-300">
              <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Authentication Issue</span>
                <span>{displayedError}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isLoading}
                  placeholder="name@studioops.local"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all disabled:opacity-50"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Password
                </label>
                <a
                  href="#/forgot-password"
                  className="text-[11px] font-semibold text-violet-400 hover:text-violet-350 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all disabled:opacity-50"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold py-3 rounded-xl shadow-lg hover:shadow-violet-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Workspace</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              disabled={isLoading}
              className="w-full text-slate-400 hover:text-white text-xs font-semibold py-2 text-center transition-colors cursor-pointer block mt-3"
            >
              Request Beta Access
            </button>
          </form>

          {/* Development Hints / Seed Credentials Helper */}
          {import.meta.env.DEV && (
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
                <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider block mb-2">
                  Development Environment Check
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  This system runs Phase 1 Local Session Authentication. Use the seed Owner credentials to sign in and begin.
                </p>
                <button
                  type="button"
                  onClick={handleFillDevCredentials}
                  disabled={isLoading}
                  className="w-full bg-[#090d16] hover:bg-slate-800/50 text-slate-300 hover:text-white border border-slate-800 rounded-lg py-2 px-3 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Autofill Seed Owner Credentials</span>
                </button>
                <div className="mt-2.5 flex flex-col gap-1 text-[10px] text-slate-500 font-mono">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-slate-400">owner@studioops.local</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Password:</span>
                    <span className="text-slate-400">ChangeMe123!</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
