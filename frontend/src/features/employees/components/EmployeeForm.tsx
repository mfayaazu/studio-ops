import React, { useState, useEffect } from 'react';
import type { Employee, EmployeeCreateRequest, EmployeeStatus } from '../types';
import { AlertTriangle } from 'lucide-react';

interface EmployeeFormProps {
  initialData?: Employee | null;
  onSubmit: (data: EmployeeCreateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryRole, setPrimaryRole] = useState('');
  const [skills, setSkills] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>('ACTIVE');
  const [createLogin, setCreateLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [userRole, setUserRole] = useState('EMPLOYEE');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setPrimaryRole(initialData.primaryRole || '');
      setSkills(initialData.skills || '');
      setStatus(initialData.status || 'ACTIVE');
      setCreateLogin(!!initialData.userId || !!initialData.loginEnabled);
      setLoginEmail(initialData.loginEmail || initialData.email || '');
      setUserRole(initialData.userRole || 'EMPLOYEE');
      setTemporaryPassword('');
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setPrimaryRole('');
      setSkills('');
      setStatus('ACTIVE');
      setCreateLogin(false);
      setLoginEmail('');
      setUserRole('EMPLOYEE');
      setTemporaryPassword('');
    }
    setValidationError(null);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!fullName.trim()) {
      setValidationError('Full Name is required.');
      return;
    }
    if (!email.trim()) {
      setValidationError('Email Address is required.');
      return;
    }
    if (!primaryRole.trim()) {
      setValidationError('Primary Role is required.');
      return;
    }
    if (createLogin) {
      if (!loginEmail.trim()) {
        setValidationError('Login Email is required when login access is enabled.');
        return;
      }
      if (!initialData?.userId && !temporaryPassword) {
        setValidationError('Temporary Password is required for new login creation.');
        return;
      }
      if (temporaryPassword && temporaryPassword.length < 6) {
        setValidationError('Password must be at least 6 characters.');
        return;
      }
    }

    const payload: EmployeeCreateRequest = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      primaryRole: primaryRole.trim(),
      skills: skills.trim() || undefined,
      status: status,
      createLogin,
      loginEmail: createLogin ? loginEmail.trim() : undefined,
      userRole: createLogin ? userRole : undefined,
      temporaryPassword: (createLogin && temporaryPassword) ? temporaryPassword : undefined
    };

    await onSubmit(payload);
  };

  const displayedError = validationError || submitError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayedError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={isSubmitting}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Michael Scott"
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Email Address <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          required
          disabled={isSubmitting}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. michael.scott@studioops.com"
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Phone Number
        </label>
        <input
          type="text"
          disabled={isSubmitting}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +1 555-0245"
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Primary Role <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={isSubmitting}
          value={primaryRole}
          onChange={(e) => setPrimaryRole(e.target.value)}
          placeholder="e.g. Lead Photographer, Assistant"
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Skills / Specialty
        </label>
        <input
          type="text"
          disabled={isSubmitting}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g. Drone, Portrait, Lighting"
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Status <span className="text-rose-500">*</span>
        </label>
        <select
          disabled={isSubmitting}
          value={status}
          onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        >
          <option value="ACTIVE">Active (Available)</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="INACTIVE">Inactive (Suspended)</option>
        </select>
      </div>

      {/* Create Login Access Section */}
      <div className="pt-2 pb-1 border-t border-slate-800/80">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            disabled={isSubmitting || (initialData?.userId !== undefined && initialData?.userId !== null)}
            checked={createLogin}
            onChange={(e) => {
              setCreateLogin(e.target.checked);
              if (e.target.checked && !loginEmail) {
                setLoginEmail(email || '');
              }
            }}
            className="rounded border-slate-800 bg-[#090d16] text-violet-600 focus:ring-violet-500/20"
          />
          <span className="text-xs font-semibold text-slate-350">
            {initialData?.userId ? "Login Access Enabled" : "Create login access"}
          </span>
        </label>
      </div>

      {createLogin && (
        <div className="p-3.5 bg-slate-950/20 border border-slate-850/80 rounded-xl space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Login Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required={createLogin}
              disabled={isSubmitting || (initialData?.userId !== undefined && initialData?.userId !== null)}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="e.g. michael.scott@studioops.com"
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              User Role <span className="text-rose-500">*</span>
            </label>
            <select
              disabled={isSubmitting}
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            >
              <option value="ADMIN">Admin</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="EDITOR">Editor</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {initialData?.userId ? "Reset Password (Optional)" : "Temporary Password *"}
            </label>
            <input
              type="password"
              required={createLogin && !initialData?.userId}
              disabled={isSubmitting}
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              placeholder={initialData?.userId ? "Leave blank to keep current" : "Minimum 6 characters"}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Team Member'}
        </button>
      </div>
    </form>
  );
};
