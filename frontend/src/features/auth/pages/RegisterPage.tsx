import React, { useState } from 'react';
import * as authApi from '../api/authApi';
import { Mail, Lock, AlertTriangle, Layers, Loader2, User, Building, Phone, Globe, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onBackToLogin }) => {
  const [studioName, setStudioName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleBackToLogin = () => {
    setIsSuccess(false);
    setStudioName('');
    setOwnerName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setCountry('');
    setError(null);
    setValidationError(null);
    onBackToLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!studioName.trim()) {
      setValidationError('Studio name is required');
      return;
    }
    if (!ownerName.trim()) {
      setValidationError('Owner name is required');
      return;
    }
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }
    if (!password) {
      setValidationError('Password is required');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.signup({
        studioName: studioName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        country: country.trim() || undefined
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request beta access. Please check details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0d1424] border border-slate-800/80 rounded-2xl shadow-2xl relative z-10 overflow-hidden text-center p-8">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 w-full absolute top-0 left-0" />
          
          <div className="flex flex-col items-center mt-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-heading font-bold text-white tracking-wide">
              Request Submitted!
            </h2>
            <p className="text-slate-400 text-xs mt-2 px-4 leading-relaxed">
              Your beta request for <strong className="text-slate-200">{studioName}</strong> has been registered. An admin will manually provision your beta workspace soon.
            </p>
          </div>

          <button
            onClick={handleBackToLogin}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Proceed to Sign In
          </button>
        </div>
      </div>
    );
  }

  const displayedError = validationError || error;

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0d1424] border border-slate-800/80 rounded-2xl shadow-2xl relative z-10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-600 to-fuchsia-500 w-full" />

        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-3">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-heading font-bold text-white tracking-wide">
              Request Beta Access
            </h1>
            <p className="text-slate-455 text-xs mt-1 text-center">
              Register your studio workspace to request beta enrollment
            </p>
          </div>

          {displayedError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs flex items-start gap-2 mb-5">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{displayedError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Studio/Company Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-slate-550" />
                </div>
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => {
                    setStudioName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isLoading}
                  placeholder="e.g. Dream Wedding Films"
                  className="w-full bg-[#090d16] border border-slate-850 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Owner Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-550" />
                </div>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => {
                    setOwnerName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isLoading}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#090d16] border border-slate-850 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Owner Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-550" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isLoading}
                  placeholder="owner@yourstudio.com"
                  className="w-full bg-[#090d16] border border-slate-850 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-550" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isLoading}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#090d16] border border-slate-850 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    placeholder="+91..."
                    className="w-full bg-[#090d16] border border-slate-850 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Country (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isLoading}
                    placeholder="India"
                    className="w-full bg-[#090d16] border border-slate-850 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-3 rounded-xl shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <span>Submit Beta Request</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              disabled={isLoading}
              className="w-full text-slate-400 hover:text-white text-xs font-medium py-2 text-center transition-colors cursor-pointer block mt-1"
            >
              Cancel and Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
