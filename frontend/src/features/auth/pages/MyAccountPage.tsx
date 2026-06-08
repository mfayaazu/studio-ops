import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import * as authApi from '../api/authApi';
import type { PageKey, AccessLevel } from '../types';
import { getThemePreference, setThemePreference } from '../../../lib/theme';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Palette, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Building,
  Mail,
  Shield,
  Check
} from 'lucide-react';

type TabId = 'profile' | 'security' | 'access' | 'appearance';

const PAGE_LABELS: Record<PageKey, string> = {
  DASHBOARD: 'Dashboard',
  FOLLOW_UP_CENTER: 'Follow-up Center',
  CLIENTS: 'Clients',
  QUOTATIONS: 'Quotations',
  PROJECTS: 'Projects',
  EVENTS: 'Events Calendar',
  DELIVERABLES: 'Deliverables & Tracking',
  BACKUP: 'Backup Center',
  POST_PRODUCTION: 'Post Production Board',
  EMPLOYEES: 'Team Allocation & Employees',
};

export const MyAccountPage: React.FC = () => {
  const { user, permissions: contextPermissions, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedTheme, setSelectedTheme] = useState(getThemePreference());

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password Visibility States
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Access Page Permissions State
  const [effectivePermissions, setEffectivePermissions] = useState<Record<PageKey, AccessLevel> | null>(contextPermissions);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  // Clear messages when tab changes
  useEffect(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, [activeTab]);

  // Sync profile display name when user updates or loads
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  // Load Permissions on Access tab mount
  useEffect(() => {
    if (activeTab === 'access') {
      setPermissionsLoading(true);
      authApi.getCurrentUserPermissions()
        .then((res) => {
          setEffectivePermissions(res.effectivePermissions);
        })
        .catch((err) => {
          console.error('Failed to load effective permissions', err);
        })
        .finally(() => {
          setPermissionsLoading(false);
        });
    }
  }, [activeTab]);

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const updatedUser = await authApi.updateProfile(displayName.trim());
      if (updatedUser) {
        updateUser(updatedUser);
        setSuccessMessage('Profile updated successfully.');
      } else {
        setErrorMessage('Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('All password fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const res = await authApi.changePassword(currentPassword, newPassword);
      setSuccessMessage(res.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    { id: 'profile' as TabId, label: 'Profile Settings', icon: User, desc: 'Manage your name and display details' },
    { id: 'security' as TabId, label: 'Security & Credentials', icon: Lock, desc: 'Update login credentials' },
    { id: 'access' as TabId, label: 'Effective Permissions', icon: ShieldCheck, desc: 'Check active access controls' },
    { id: 'appearance' as TabId, label: 'Visual Interface', icon: Palette, desc: 'Choose theme and appearance' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <h2 className="text-2xl font-heading font-bold text-white tracking-wide">My Account</h2>
        <p className="text-slate-400 text-xs mt-1">Manage your self-service settings, profile information, password security, and active permission rules.</p>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column - Navigation Options Card */}
        <div className="w-full lg:w-72 shrink-0 bg-[#0d1424] border border-slate-800/80 rounded-xl p-4 shadow-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-3">Account Section</span>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start gap-3.5 px-3 py-3 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-500/10 border-l-2 border-violet-500 text-white'
                    : 'text-slate-450 hover:text-slate-200 hover:bg-slate-800/30 border-l-2 border-transparent'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{item.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column - Active Pane Panel Card */}
        <div className="flex-1 w-full bg-[#0d1424] border border-slate-800/80 rounded-xl p-6 lg:p-8 shadow-xl relative min-h-[460px]">
          
          {/* Notification Alerts inside Content Panel */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3.5 rounded-lg text-xs font-medium animate-in fade-in duration-250">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3.5 rounded-lg text-xs font-medium animate-in fade-in duration-250">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PROFILE SECTION */}
          {activeTab === 'profile' && user && (
            <div className="space-y-6">
              {/* Profile Card Header with Initials Avatar */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-800/80">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-violet-650 to-fuchsia-600 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-violet-500/15 border border-violet-500/20 shrink-0">
                  {getInitials(user.displayName, user.email)}
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <h4 className="text-base font-bold text-white tracking-wide truncate">
                    {user.displayName || 'No Name'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    <span className="text-[10px] font-mono font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase">
                      {user.role}
                    </span>
                    {user.studioName && (
                      <span className="text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded-full uppercase">
                        {user.studioName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-500 transition-colors"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Login Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550" />
                      <input
                        type="email"
                        readOnly
                        disabled
                        value={user.email}
                        className="w-full bg-[#090d16]/40 border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block">Account identity emails can only be altered by system administrators.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Effective Role</label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550" />
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={user.role}
                        className="w-full bg-[#090d16]/40 border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-550 font-semibold tracking-wide uppercase cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {user.studioName && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Studio Association</label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550" />
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={`${user.studioName} (${user.studioStatus || 'ACTIVE'})`}
                          className="w-full bg-[#090d16]/40 border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-550 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/50 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs py-2.5 px-6 rounded-xl shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECURITY SECTION */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Security & Credentials</h3>
                <p className="text-slate-450 text-[11px] mt-1">Keep your account safe by updating your password periodically. We recommend a secure passphrase.</p>
              </div>

              <div className="space-y-5 max-w-md border-t border-slate-800/60 pt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg pl-4 pr-10 py-2 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-500 transition-colors"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg pl-4 pr-10 py-2 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-500 transition-colors"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg pl-4 pr-10 py-2 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-500 transition-colors"
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-800/50 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs py-2.5 px-6 rounded-xl shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Change Password</span>
                </button>
              </div>
            </form>
          )}

          {/* ACCESS/PERMISSIONS SECTION */}
          {activeTab === 'access' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">System Access Permissions</h3>
                <p className="text-slate-450 text-[11px] mt-1">Review the module-by-module authorization details applied to your workspace login.</p>
              </div>

              {permissionsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-7 w-7 text-violet-500 animate-spin" />
                  <span className="text-slate-500 text-[11px] font-medium tracking-wide">Loading system logs...</span>
                </div>
              ) : (
                <div className="space-y-4 border-t border-slate-800/60 pt-5">
                  <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-[#090d16]/30">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-850 text-slate-400 font-semibold">
                          <th className="px-4 py-3">Module Name</th>
                          <th className="px-4 py-3 text-right">Access Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/60 text-slate-300">
                        {effectivePermissions && Object.entries(effectivePermissions).map(([key, level]) => {
                          const label = PAGE_LABELS[key as PageKey] || key;
                          return (
                            <tr key={key} className="hover:bg-slate-800/10 transition-colors">
                              <td className="px-4 py-3.5 font-medium">{label}</td>
                              <td className="px-4 py-3.5 text-right">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider border ${
                                  level === 'EDIT'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : level === 'VIEW'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-slate-800/40 border-slate-800 text-slate-500'
                                }`}>
                                  {level}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal italic text-center">
                    “Your permissions are managed by your studio owner/admin.”
                  </p>
                </div>
              )}
            </div>
          )}

          {/* APPEARANCE SECTION */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Appearance & Themes</h3>
                <p className="text-slate-455 text-[11px] mt-1">Configure your workspace styling and theme options to suit your taste.</p>
              </div>

              {/* Theme Mockup Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/60 pt-5">
                
                {/* Dark Option Card */}
                <button
                  type="button"
                  onClick={() => {
                    setThemePreference('dark');
                    setSelectedTheme('dark');
                  }}
                  className={`text-left border-2 rounded-xl p-4 flex flex-col justify-between h-36 relative shadow-lg transition-all cursor-pointer ${
                    selectedTheme === 'dark'
                      ? 'border-violet-500 bg-[#090d16] shadow-violet-500/5'
                      : 'border-slate-800/80 bg-slate-900/10 hover:border-slate-700/50 hover:bg-slate-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <h4 className="text-xs font-bold text-white">Pro Dark</h4>
                      <p className="text-[9px] text-slate-550 mt-1">Rich slate & violet gradients</p>
                    </div>
                    {selectedTheme === 'dark' && (
                      <span className="bg-violet-500/20 text-violet-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-violet-500/30 font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 w-full">
                    <div className="h-1.5 w-1/2 bg-slate-800 rounded"></div>
                    <div className="h-1.5 w-3/4 bg-slate-800 rounded"></div>
                    <div className="flex gap-1 mt-2">
                      <div className="h-3 w-3 rounded-full bg-violet-600"></div>
                      <div className="h-3 w-3 rounded-full bg-[#0d1424] border border-slate-800"></div>
                    </div>
                  </div>
                  {selectedTheme === 'dark' && (
                    <div className="absolute bottom-3 right-3 h-5 w-5 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>

                {/* Light Option Card */}
                <button
                  type="button"
                  onClick={() => {
                    setThemePreference('light');
                    setSelectedTheme('light');
                  }}
                  className={`text-left border-2 rounded-xl p-4 flex flex-col justify-between h-36 relative shadow-lg transition-all cursor-pointer ${
                    selectedTheme === 'light'
                      ? 'border-violet-500 bg-white shadow-violet-500/5'
                      : 'border-slate-800/80 bg-slate-900/10 hover:border-slate-700/50 hover:bg-slate-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <h4 className={`text-xs font-bold ${selectedTheme === 'light' ? 'text-slate-900' : 'text-slate-400'}`}>Classic Light</h4>
                      <p className={`text-[9px] mt-1 ${selectedTheme === 'light' ? 'text-slate-500' : 'text-slate-650'}`}>Bright & clean contrast</p>
                    </div>
                    {selectedTheme === 'light' && (
                      <span className="bg-violet-500/20 text-violet-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-violet-500/30 font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 w-full">
                    <div className={`h-1.5 w-1/2 rounded ${selectedTheme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
                    <div className={`h-1.5 w-3/4 rounded ${selectedTheme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
                    <div className="flex gap-1 mt-2">
                      <div className="h-3 w-3 rounded-full bg-slate-400"></div>
                      <div className="h-3 w-3 rounded-full bg-slate-200 border border-slate-300"></div>
                    </div>
                  </div>
                  {selectedTheme === 'light' && (
                    <div className="absolute bottom-3 right-3 h-5 w-5 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>

                {/* System Option Card */}
                <button
                  type="button"
                  onClick={() => {
                    setThemePreference('system');
                    setSelectedTheme('system');
                  }}
                  className={`text-left border-2 rounded-xl p-4 flex flex-col justify-between h-36 relative shadow-lg transition-all cursor-pointer ${
                    selectedTheme === 'system'
                      ? 'border-violet-500 bg-[#0d1424] shadow-violet-500/5'
                      : 'border-slate-800/80 bg-slate-900/10 hover:border-slate-700/50 hover:bg-slate-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <h4 className="text-xs font-bold text-white">Auto System</h4>
                      <p className="text-[9px] text-slate-550 mt-1">Sync with OS preferences</p>
                    </div>
                    {selectedTheme === 'system' && (
                      <span className="bg-violet-500/20 text-violet-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-violet-500/30 font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 w-full">
                    <div className="h-1.5 w-1/2 bg-slate-800 rounded"></div>
                    <div className="h-1.5 w-3/4 bg-slate-800 rounded"></div>
                    <div className="flex gap-1 mt-2">
                      <div className="h-3 w-3 rounded-full bg-slate-700"></div>
                      <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                    </div>
                  </div>
                  {selectedTheme === 'system' && (
                    <div className="absolute bottom-3 right-3 h-5 w-5 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>

              </div>
              
              <div className="pt-2 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-500 block leading-normal italic text-center">
                  Select a theme preference. The setting will apply immediately to your browser layout.
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
