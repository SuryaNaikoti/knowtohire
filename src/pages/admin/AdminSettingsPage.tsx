import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/context/AuthContext';
import {
  adminSettingsService,
  MasterAdminSettings,
} from '@/services/adminSettingsService';
import {
  User,
  Shield,
  Lock,
  Bell,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Save,
  Loader2,
  ShieldCheck,
  Globe,
} from 'lucide-react';

type TabKey = 'profile' | 'platform' | 'governance' | 'security' | 'notifications' | 'creator';

export interface AdminSettingsPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onNavigate }) => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [settings, setSettings] = useState<MasterAdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    const res = await adminSettingsService.getSettings();
    if (res.data) {
      setSettings(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();

    const handleSettingsChanged = () => {
      fetchSettings();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('kth_admin_settings_changed', handleSettingsChanged);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_admin_settings_changed', handleSettingsChanged);
      }
    };
  }, [fetchSettings]);

  const handleDiscard = async () => {
    await fetchSettings();
    setErrorMessage(null);
    setSaveSuccess(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    const res = await adminSettingsService.updateSettings(settings);
    setIsSaving(false);

    if (res.error) {
      setErrorMessage(res.error.message);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const handleDeactivateAdminAccount = async () => {
    try {
      setIsDeactivating(true);
      const userId = user?.id || '00000000-0000-0000-0000-000000000003';
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem('kth_admin_user_status_overrides');
          const current = raw ? JSON.parse(raw) : {};
          current[userId] = 'suspended';
          current['demo-admin-003'] = 'suspended';
          window.localStorage.setItem('kth_admin_user_status_overrides', JSON.stringify(current));

          const profileCustomRaw = window.localStorage.getItem(`kth_demo_profile_custom_${userId}`);
          const profileCustom = profileCustomRaw ? JSON.parse(profileCustomRaw) : {};
          profileCustom.status = 'suspended';
          profileCustom.deactivated_at = new Date().toISOString();
          window.localStorage.setItem(`kth_demo_profile_custom_${userId}`, JSON.stringify(profileCustom));
        } catch {
          // ignore
        }
      }
      await logout();
      if (onNavigate) {
        onNavigate('/login');
      } else {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new Event('popstate'));
      }
    } catch (err) {
      console.error('[AdminSettingsPage] Deactivation error:', err);
      await logout();
      if (onNavigate) {
        onNavigate('/login');
      } else {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new Event('popstate'));
      }
    } finally {
      setIsDeactivating(false);
      setIsDeactivateDialogOpen(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <AdminShell title="Platform Administration Settings" currentPath="/admin/settings" onNavigate={onNavigate}>
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
          <p className="text-xs text-kth-slate-500 font-medium">Loading administrative settings...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Platform Administration Settings" currentPath="/admin/settings" onNavigate={onNavigate}>
      <div className="space-y-6 font-sans max-w-6xl mx-auto">
        {/* Header with Save Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-kth-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="indigo">Superuser Governance</Badge>
              <Badge variant="slate">Multi-Tenant Engine</Badge>
            </div>
            <h2 className="font-display text-xl font-extrabold text-kth-slate-900">
              Master Platform Configuration
            </h2>
            <p className="text-xs text-kth-slate-500">
              Manage administrator credentials, global operational policies, role permissions, and system notification preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" /> Settings Saved!
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              disabled={isSaving}
              onClick={handleDiscard}
            >
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              isLoading={isSaving}
              onClick={() => handleSave()}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Settings Tabs Sidebar */}
          <div className="md:col-span-3 space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-kth-slate-900 text-white shadow-xs'
                  : 'bg-white text-kth-slate-600 hover:bg-kth-slate-50 border border-kth-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Admin Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('platform')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'platform'
                  ? 'bg-kth-slate-900 text-white shadow-xs'
                  : 'bg-white text-kth-slate-600 hover:bg-kth-slate-50 border border-kth-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Platform Config</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('governance')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'governance'
                  ? 'bg-kth-slate-900 text-white shadow-xs'
                  : 'bg-white text-kth-slate-600 hover:bg-kth-slate-50 border border-kth-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Role Governance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-kth-slate-900 text-white shadow-xs'
                  : 'bg-white text-kth-slate-600 hover:bg-kth-slate-50 border border-kth-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security & Session</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-kth-slate-900 text-white shadow-xs'
                  : 'bg-white text-kth-slate-600 hover:bg-kth-slate-50 border border-kth-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('creator')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'creator'
                  ? 'bg-kth-slate-900 text-white shadow-xs'
                  : 'bg-white text-kth-slate-600 hover:bg-kth-slate-50 border border-kth-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Creator Monetization</span>
            </button>
          </div>

          {/* Active Settings Panel */}
          <div className="md:col-span-9">
            <Card className="p-6 bg-white border-kth-slate-200">
              {/* 1. ADMIN PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-kth-slate-900">Administrator Profile & Contact</h3>
                    <p className="text-xs text-kth-slate-500">Superuser identification and emergency platform escalation details.</p>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-kth-slate-900 text-amber-400 flex items-center justify-center text-lg font-extrabold shadow-xs">
                      A
                    </div>
                    <div>
                      <div className="font-bold text-sm text-kth-slate-900">{settings.profile.fullName}</div>
                      <div className="text-xs text-kth-slate-500 font-mono">{settings.profile.email}</div>
                      <Badge variant="amber" className="mt-1">Master Superuser</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Administrator Name"
                      value={settings.profile.fullName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          profile: { ...settings.profile, fullName: e.target.value },
                        })
                      }
                      required
                    />

                    <Input
                      label="Administrator Email (Read-Only Identity)"
                      value={settings.profile.email}
                      disabled
                      helperText="Platform Superuser authentication email"
                    />

                    <Input
                      label="Support & Escalation Phone"
                      value={settings.profile.phone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          profile: { ...settings.profile, phone: e.target.value },
                        })
                      }
                      placeholder="+91 80 4920 1800"
                    />

                    <Input
                      label="Designation / Role Title"
                      value={settings.profile.designation}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          profile: { ...settings.profile, designation: e.target.value },
                        })
                      }
                      placeholder="Master Superuser & Governance Lead"
                    />
                  </div>
                </div>
              )}

              {/* 2. PLATFORM CONFIG TAB */}
              {activeTab === 'platform' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-kth-slate-900">Platform & Regional Settings</h3>
                    <p className="text-xs text-kth-slate-500">Core operational branding, support routing, and currency configuration.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Platform Brand Name"
                        value={settings.platform.platformName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            platform: { ...settings.platform, platformName: e.target.value },
                          })
                        }
                      />
                    </div>

                    <Input
                      label="Customer Support Contact Email"
                      value={settings.platform.supportEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          platform: { ...settings.platform, supportEmail: e.target.value },
                        })
                      }
                    />

                    <Select
                      label="Operational Currency"
                      value={settings.platform.operationalCurrency}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          platform: { ...settings.platform, operationalCurrency: e.target.value },
                        })
                      }
                      options={[
                        { value: 'INR (₹ Indian Rupee)', label: 'INR (₹ Indian Rupee) — Primary' },
                        { value: 'USD ($ US Dollar)', label: 'USD ($ US Dollar) — Global' },
                      ]}
                    />

                    <Select
                      label="Job Posting Moderation Policy"
                      value={settings.platform.jobModerationMode}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          platform: {
                            ...settings.platform,
                            jobModerationMode: e.target.value as 'auto_publish' | 'manual_review',
                          },
                        })
                      }
                      options={[
                        { value: 'auto_publish', label: 'Auto-Publish for Verified Employers' },
                        { value: 'manual_review', label: 'Mandatory Admin Review Before Publishing' },
                      ]}
                    />

                    <div className="flex items-center justify-between p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
                      <div>
                        <span className="text-xs font-bold text-kth-slate-900 block">Maintenance Mode</span>
                        <span className="text-[11px] text-kth-slate-500">Restrict public access for system upgrades</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.platform.maintenanceMode}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            platform: { ...settings.platform, maintenanceMode: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-kth-primary-600 rounded border-kth-slate-300 focus:ring-kth-primary-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ROLE GOVERNANCE TAB */}
              {activeTab === 'governance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-kth-slate-900">Role & User Lifecycle Governance</h3>
                    <p className="text-xs text-kth-slate-500">Set onboarding default states, corporate verification rules, and upload quotas.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Default Candidate Account Status"
                      value={settings.governance.defaultCandidateStatus}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          governance: {
                            ...settings.governance,
                            defaultCandidateStatus: e.target.value as 'active' | 'pending_onboarding',
                          },
                        })
                      }
                      options={[
                        { value: 'active', label: 'Active (Immediate Portal Access)' },
                        { value: 'pending_onboarding', label: 'Pending Onboarding (Mandatory Step)' },
                      ]}
                    />

                    <Select
                      label="Default Employer Enterprise Status"
                      value={settings.governance.defaultEmployerStatus}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          governance: {
                            ...settings.governance,
                            defaultEmployerStatus: e.target.value as 'unverified' | 'pending_review' | 'verified',
                          },
                        })
                      }
                      options={[
                        { value: 'verified', label: 'Verified (Instant Job Posting)' },
                        { value: 'pending_review', label: 'Pending Review (Admin Verification Queue)' },
                        { value: 'unverified', label: 'Unverified (Strict Sandbox)' },
                      ]}
                    />

                    <Select
                      label="Maximum Resume Document Upload Size"
                      value={String(settings.governance.maxResumeFileSizeMB)}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          governance: {
                            ...settings.governance,
                            maxResumeFileSizeMB: Number(e.target.value),
                          },
                        })
                      }
                      options={[
                        { value: '5', label: '5 MB (Standard PDF/DOCX)' },
                        { value: '10', label: '10 MB (Recommended)' },
                        { value: '25', label: '25 MB (Heavy Portfolios)' },
                      ]}
                    />

                    <div className="flex items-center justify-between p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
                      <div>
                        <span className="text-xs font-bold text-kth-slate-900 block">Corporate Email Requirement</span>
                        <span className="text-[11px] text-kth-slate-500">Block public domain emails (gmail, yahoo) for employers</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.governance.requireCorporateEmailForEmployers}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            governance: {
                              ...settings.governance,
                              requireCorporateEmailForEmployers: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-kth-primary-600 rounded border-kth-slate-300 focus:ring-kth-primary-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SECURITY & SESSION TAB */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-kth-slate-900">Security Policies & Session Controls</h3>
                    <p className="text-xs text-kth-slate-500">Row Level Security status, inactivity auto-logout, and multi-factor enforcement.</p>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold text-emerald-900 block">PostgreSQL Row-Level Security (RLS)</span>
                        <span className="text-[11px] text-emerald-700">All tenant queries strictly scoped by auth.uid() in Supabase</span>
                      </div>
                    </div>
                    <Badge variant="emerald">Active & Enforced</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Admin Session Inactivity Timeout"
                      value={String(settings.security.sessionTimeoutMinutes)}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            sessionTimeoutMinutes: Number(e.target.value),
                          },
                        })
                      }
                      options={[
                        { value: '30', label: '30 Minutes (High Security)' },
                        { value: '60', label: '60 Minutes (Standard)' },
                        { value: '240', label: '4 Hours (Extended Session)' },
                        { value: '1440', label: '24 Hours (Full Day)' },
                      ]}
                    />

                    <div className="flex items-center justify-between p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
                      <div>
                        <span className="text-xs font-bold text-kth-slate-900 block">Multi-Factor Authentication (MFA)</span>
                        <span className="text-[11px] text-kth-slate-500">Require OTP confirmation for superuser actions</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.enforceMFA}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: { ...settings.security, enforceMFA: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-kth-primary-600 rounded border-kth-slate-300 focus:ring-kth-primary-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
                      <div>
                        <span className="text-xs font-bold text-kth-slate-900 block">Audit Activity Logging</span>
                        <span className="text-[11px] text-kth-slate-500">Log all job moderation, verification, and CMS operations</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.auditLoggingEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: { ...settings.security, auditLoggingEnabled: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-kth-primary-600 rounded border-kth-slate-300 focus:ring-kth-primary-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Danger Zone: Administrator Session & Superuser Access */}
                  <div className="mt-6 p-5 bg-rose-50/40 border border-rose-200 rounded-2xl">
                    <div className="flex items-center gap-2 text-rose-900 font-bold text-sm mb-1">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Danger Zone — Administrative Session Suspension</span>
                    </div>
                    <p className="text-xs text-rose-800/80 mb-4">
                      Deactivating your administrator account immediately locks down active superuser privileges and terminates all governance sessions.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsDeactivateDialogOpen(true)}
                    >
                      Deactivate Administrator Account
                    </Button>
                  </div>
                </div>
              )}

              {/* 5. NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-kth-slate-900">Administrative Notifications & Alerts</h3>
                    <p className="text-xs text-kth-slate-500">Choose when the platform sends administrative event notifications.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
                      <div>
                        <span className="text-xs font-bold text-kth-slate-900 block">New Employer Enterprise Registration</span>
                        <span className="text-[11px] text-kth-slate-500">Send email notification when an employer organization signs up</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailOnNewEmployerRegistration}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              emailOnNewEmployerRegistration: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-kth-primary-600 rounded border-kth-slate-300 focus:ring-kth-primary-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
                      <div>
                        <span className="text-xs font-bold text-kth-slate-900 block">New Job Post Submission</span>
                        <span className="text-[11px] text-kth-slate-500">Alert admin team when a new job requisition is created</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailOnNewJobPost}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              emailOnNewJobPost: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-kth-primary-600 rounded border-kth-slate-300 focus:ring-kth-primary-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
                      <div>
                        <span className="text-xs font-bold text-kth-slate-900 block">On-Demand Content Request</span>
                        <span className="text-[11px] text-kth-slate-500">Notify editorial team when a user requests custom research or templates</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailOnContentRequest}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              emailOnContentRequest: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-kth-primary-600 rounded border-kth-slate-300 focus:ring-kth-primary-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
                      <div>
                        <span className="text-xs font-bold text-kth-slate-900 block">Daily Platform Metrics Digest</span>
                        <span className="text-[11px] text-kth-slate-500">Receive summary email of daily applications, registrations, and downloads</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.dailyPlatformMetricsDigest}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              dailyPlatformMetricsDigest: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-kth-primary-600 rounded border-kth-slate-300 focus:ring-kth-primary-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. CREATOR & MONETIZATION TAB */}
              {activeTab === 'creator' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-kth-slate-900">Creator Commission & Payout Thresholds</h3>
                    <p className="text-xs text-kth-slate-500">
                      Configure platform commission splits, minimum payout thresholds, and featured job duration limits.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Minimum Creator Payout Threshold (₹ INR)"
                      type="number"
                      value={settings.creatorPayout?.minPayoutThresholdINR ?? 1500}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          creatorPayout: {
                            ...settings.creatorPayout,
                            minPayoutThresholdINR: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                      helperText="Default: ₹1,500. Creators cannot request a payout until available earnings reach this amount."
                      required
                    />

                    <Input
                      label="Creator Commission Share (%)"
                      type="number"
                      min={1}
                      max={100}
                      value={settings.creatorPayout?.creatorCommissionPct ?? 70}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          creatorPayout: {
                            ...settings.creatorPayout,
                            creatorCommissionPct: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                      helperText="Percentage of template/resource revenue paid to creators (e.g., 70% Creator / 30% Platform)."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <Input
                      label="Default Featured Job Duration (Days)"
                      type="number"
                      min={1}
                      max={90}
                      value={settings.creatorPayout?.defaultFeaturedJobDurationDays ?? 7}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          creatorPayout: {
                            ...settings.creatorPayout,
                            defaultFeaturedJobDurationDays: parseInt(e.target.value, 10) || 7,
                          },
                        })
                      }
                      helperText="Default number of days a job post remains highlighted in the Featured section."
                      required
                    />
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-emerald-900 block">Configurable Business Rules</span>
                    <p className="text-emerald-800">
                      Adjusting the payout threshold or commission share dynamically updates all Creator earnings calculations and payout eligibility checks platform-wide without code modifications.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Card Save Button */}
              <div className="mt-8 pt-4 border-t border-kth-slate-200 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Save className="w-4 h-4" />}
                  isLoading={isSaving}
                  onClick={() => handleSave()}
                >
                  Save Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Administrator Deactivation Confirmation Dialog */}
      <Dialog
        isOpen={isDeactivateDialogOpen}
        onClose={() => !isDeactivating && setIsDeactivateDialogOpen(false)}
        title="Deactivate Administrator Account?"
        description="Are you sure you want to deactivate administrative access and terminate this session?"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              All platform data remains intact. To restore governance privileges later, root database access or another superuser will be required.
            </span>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isDeactivating}
              onClick={() => setIsDeactivateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              isLoading={isDeactivating}
              onClick={handleDeactivateAdminAccount}
            >
              Confirm Deactivation
            </Button>
          </div>
        </div>
      </Dialog>
    </AdminShell>
  );
};
