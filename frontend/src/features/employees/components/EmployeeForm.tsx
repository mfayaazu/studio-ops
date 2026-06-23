import React, { useState, useEffect } from 'react';
import type { Employee, EmployeeCreateRequest, EmployeeStatus } from '../types';
import type { PageKey, UserRole } from '../../auth/types';
import { ROLE_PAGE_DEFAULTS } from '../../auth/permissions';
import { useAuth } from '../../auth/AuthProvider';
import * as authApi from '../../auth/api/authApi';
import { AlertTriangle } from 'lucide-react';

interface EmployeeFormProps {
  initialData?: Employee | null;
  onSubmit: (
    data: EmployeeCreateRequest,
    permissionsOverrides?: { pageKey: string; accessLevel: string }[]
  ) => Promise<void>;
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
  const { user } = useAuth();
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
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');

  const PAGE_KEYS: PageKey[] = [
    'DASHBOARD',
    'FOLLOW_UP_CENTER',
    'CLIENTS',
    'QUOTATIONS',
    'PROJECTS',
    'EVENTS',
    'DELIVERABLES',
    'BACKUP',
    'POST_PRODUCTION',
    'EMPLOYEES'
  ];

  const PAGE_LABELS: Record<PageKey, string> = {
    DASHBOARD: 'Dashboard',
    FOLLOW_UP_CENTER: 'Follow-up Center',
    CLIENTS: 'Clients',
    QUOTATIONS: 'Quotations',
    PROJECTS: 'Projects',
    EVENTS: 'Events Calendar',
    DELIVERABLES: 'Deliverables',
    BACKUP: 'Backup Center',
    POST_PRODUCTION: 'Post Production',
    EMPLOYEES: 'Employees / Team'
  };

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
      setSendInviteEmail(!(initialData.userId || initialData.loginEnabled));
      setLeaveFrom(initialData.leaveFrom || '');
      setLeaveTo(initialData.leaveTo || '');

      if (initialData.userId) {
        const loadPerms = async () => {
          setLoadingPerms(true);
          try {
            const res = await authApi.getUserPermissions(initialData.userId!);
            const overrideMap: Record<string, string> = {};
            res.explicitOverrides.forEach(o => {
              overrideMap[o.pageKey] = o.accessLevel;
            });
            setOverrides(overrideMap);
          } catch (err) {
            console.error('Failed to load user permissions', err);
          } finally {
            setLoadingPerms(false);
          }
        };
        loadPerms();
      } else {
        setOverrides({});
      }
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
      setSendInviteEmail(true);
      setOverrides({});
      setLeaveFrom('');
      setLeaveTo('');
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
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
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
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(loginEmail.trim())) {
        setValidationError('Please enter a valid email address.');
        return;
      }
      if (!sendInviteEmail && !initialData?.userId && !temporaryPassword) {
        setValidationError('Temporary Password is required when invite email is disabled.');
        return;
      }
      if (temporaryPassword && temporaryPassword.length < 6) {
        setValidationError('Password must be at least 6 characters.');
        return;
      }
    }
    if (status === 'ON_LEAVE') {
      if (!leaveFrom) {
        setValidationError('Leave From date is required when status is On Leave.');
        return;
      }
      if (!leaveTo) {
        setValidationError('Leave To date is required when status is On Leave.');
        return;
      }
      if (new Date(leaveFrom) > new Date(leaveTo)) {
        setValidationError('Leave From date cannot be after Leave To date.');
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
      temporaryPassword: (createLogin && temporaryPassword) ? temporaryPassword : undefined,
      sendInviteEmail: createLogin ? sendInviteEmail : undefined,
      leaveFrom: status === 'ON_LEAVE' ? leaveFrom : undefined,
      leaveTo: status === 'ON_LEAVE' ? leaveTo : undefined
    };

    const permissionsPayload = createLogin ? Object.entries(overrides)
      .filter(([_, level]) => level !== 'DEFAULT')
      .map(([pageKey, level]) => ({
        pageKey,
        accessLevel: level
      })) : undefined;

    await onSubmit(payload, permissionsPayload);
  };

  const displayedError = validationError || submitError;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      {displayedError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2 mb-4 flex-none">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 min-h-0 max-h-[calc(100vh-240px)]">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {status === 'ON_LEAVE' && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Leave From Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                disabled={isSubmitting}
                value={leaveFrom}
                onChange={(e) => setLeaveFrom(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Leave To Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                disabled={isSubmitting}
                value={leaveTo}
                onChange={(e) => setLeaveTo(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 font-mono"
              />
            </div>
          </>
        )}
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
        <div className="p-3.5 bg-slate-950/20 border border-slate-850/80 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Login Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required={createLogin}
                disabled={isSubmitting}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. michael.scott@studioops.com"
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Login email must be unique and cannot be the owner/admin email unless this employee is already linked to that account.
              </p>
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
          </div>

          <div className="pt-2 border-t border-slate-800/60">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isSubmitting}
                checked={sendInviteEmail}
                onChange={(e) => setSendInviteEmail(e.target.checked)}
                className="rounded border-slate-800 bg-[#090d16] text-violet-600 focus:ring-violet-500/20 mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-300">
                  {initialData?.userId ? "Send new login invitation link (Resend)" : "Send email invitation"}
                </span>
                <p className="text-[11px] text-slate-500">
                  {initialData?.userId
                    ? "The employee will receive a new secure link to set their password."
                    : "The employee will receive a secure link to activate their account and set their password."
                  }
                </p>
              </div>
            </label>
          </div>

          {!sendInviteEmail && (
            <div className="space-y-1 pt-2 border-t border-slate-800/60">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {initialData?.userId ? "Reset Password (Optional)" : "Temporary Password *"}
              </label>
              <input
                type="password"
                required={createLogin && !initialData?.userId && !sendInviteEmail}
                disabled={isSubmitting}
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                placeholder={initialData?.userId ? "Leave blank to keep current" : "Minimum 6 characters"}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 max-w-md"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You must manually share this password with the employee.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Page Access Overrides Section */}
      {createLogin && (
        <div className="pt-4 border-t border-slate-800/80 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-350 uppercase tracking-wider">Page Access Permissions</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Customize overrides for specific pages. Leaving as default inherits role presets.</p>
          </div>

          {loadingPerms ? (
            <div className="text-center py-4 text-xs font-mono text-slate-500">Loading user permissions...</div>
          ) : (
            <div className="border border-slate-800/60 rounded-xl overflow-x-auto bg-slate-950/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-900/30 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-3 py-1.5">Module</th>
                    <th className="px-3 py-1.5">Default</th>
                    <th className="px-3 py-1.5">Override</th>
                    <th className="px-3 py-1.5">Effective</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {PAGE_KEYS.map((pageKey) => {
                    const defaultLevel = ROLE_PAGE_DEFAULTS[userRole as UserRole]?.[pageKey] || 'NONE';
                    const currentOverride = overrides[pageKey] || 'DEFAULT';
                    const effectiveLevel = currentOverride === 'DEFAULT' ? defaultLevel : currentOverride;
                    
                    // Determine if input is disabled
                    const isSelf = user?.id === initialData?.userId;
                    const isTargetOwner = userRole === 'OWNER';
                    const isRequesterAdminOrOwner = user?.role === 'OWNER' || user?.role === 'ADMIN';
                    const isDisabled = isSelf || isTargetOwner || !isRequesterAdminOrOwner || isSubmitting;

                    return (
                      <tr key={pageKey} className="hover:bg-slate-900/10">
                        <td className="px-3 py-1.5 font-medium text-slate-200">{PAGE_LABELS[pageKey]}</td>
                        <td className="px-3 py-1.5 font-mono text-[11px] text-slate-500">{defaultLevel}</td>
                        <td className="px-3 py-1.5">
                          <select
                            disabled={isDisabled}
                            value={currentOverride}
                            onChange={(e) => {
                              setOverrides(prev => ({
                                ...prev,
                                [pageKey]: e.target.value
                              }));
                            }}
                            className="bg-[#090d16] border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-250 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                          >
                            <option value="DEFAULT">Default</option>
                            <option value="NONE">None</option>
                            <option value="VIEW">View</option>
                            <option value="EDIT">Edit</option>
                          </select>
                        </td>
                        <td className="px-3 py-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            effectiveLevel === 'EDIT'
                              ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                              : effectiveLevel === 'VIEW'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-slate-900 text-slate-500 border border-slate-850'
                          }`}>
                            {effectiveLevel}
                          </span>
                          {currentOverride !== 'DEFAULT' && (
                            <span className="ml-1.5 text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                              Override
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {user?.id === initialData?.userId && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-450 p-3 rounded-lg text-[11px]">
              Note: You cannot modify your own page-level overrides.
            </div>
          )}
        </div>
      )}

      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-850 bg-[#0d1424] flex-none mt-4">
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
