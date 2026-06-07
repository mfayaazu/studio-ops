import React, { useState } from 'react';
import * as authApi from '../api/authApi';
import { Mail, ArrowLeft, AlertTriangle, CheckCircle, Layers, Loader2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
              Reset Password
            </h1>
            <p className="text-slate-400 text-xs mt-1 text-center">
              Provide your email to receive a secure password reset link.
            </p>
          </div>

          {success ? (
            <div className="space-y-6 text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 mx-auto">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-heading font-semibold text-white">Reset Link Sent</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  If an account exists for <span className="text-slate-200 font-semibold">{email}</span>, you will receive an email with instructions shortly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { window.location.hash = '#/'; }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-violet-500/20 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Login</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs flex items-start gap-2.5 mb-2">
                  <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Error occurred</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

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
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    placeholder="name@studioops.com"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold py-3 rounded-xl shadow-lg hover:shadow-violet-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { window.location.hash = '#/'; }}
                disabled={isLoading}
                className="w-full text-slate-450 hover:text-white text-xs font-semibold py-2 text-center transition-colors cursor-pointer block mt-3"
              >
                Cancel and Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
