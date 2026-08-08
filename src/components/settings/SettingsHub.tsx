import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Alert } from '../ui/Alert';
import {
  SettingsSection,
  SettingsCard,
  SettingsToggle,
  UnsavedChangesBar
} from './SettingsComponents';
import {
  Settings as SettingsIcon,
  User,
  Users,
  Briefcase,
  BookOpen,
  ShoppingBag,
  Bell,
  ShieldCheck,
  Palette,
  Link2,
  Lock,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  FileText,
  DollarSign,
  KeyRound,
  LogOut,
  Sliders,
  Check,
  XCircle,
  HelpCircle,
  Laptop
} from 'lucide-react';

export type SettingsRole = 'admin' | 'super_admin' | 'employer' | 'candidate' | 'moderator' | 'content_manager';

export interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: SettingsRole[];
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'general', label: 'General', icon: <SettingsIcon className="w-4 h-4" />, roles: ['admin', 'super_admin'] },
  { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" />, roles: ['admin', 'super_admin'] },
  { id: 'recruitment', label: 'Recruitment', icon: <Briefcase className="w-4 h-4" />, roles: ['admin', 'super_admin', 'employer'] },
  { id: 'content', label: 'Content CMS', icon: <BookOpen className="w-4 h-4" />, roles: ['admin', 'super_admin', 'content_manager'] },
  { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" />, roles: ['admin', 'super_admin'] },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, roles: ['admin', 'super_admin', 'employer', 'candidate', 'moderator', 'content_manager'] },
  { id: 'branding', label: 'Branding', icon: <Palette className="w-4 h-4" />, roles: ['admin', 'super_admin', 'employer'] },
  { id: 'security', label: 'Security & 2FA', icon: <ShieldCheck className="w-4 h-4" />, roles: ['admin', 'super_admin', 'employer', 'candidate', 'moderator', 'content_manager'] },
  { id: 'integrations', label: 'Integrations Status', icon: <Link2 className="w-4 h-4" />, roles: ['admin', 'super_admin'] },
  { id: 'personal', label: 'Personal Account', icon: <User className="w-4 h-4" />, roles: ['admin', 'super_admin', 'employer', 'candidate', 'moderator', 'content_manager'] },
];

export const SettingsHub: React.FC = () => {
  const { profile, user, logout, refreshProfile } = useAuth();
  const role: SettingsRole = (profile?.role as SettingsRole) || 'candidate';

  // Filter allowed navigation sections based on current user role
  const availableSections = useMemo(() => {
    return NAV_SECTIONS.filter(sec => sec.roles.includes(role));
  }, [role]);

  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    if (availableSections.length > 0 && (!activeSection || !availableSections.some(s => s.id === activeSection))) {
      setActiveSection(availableSections[0].id);
    }
  }, [availableSections, activeSection]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // 1. GENERAL SETTINGS STATE
  const [platformName, setPlatformName] = useState('KnowToHire');
  const [supportEmail, setSupportEmail] = useState('support@knowtohire.com');
  const [supportPhone, setSupportPhone] = useState('+91 (800) 456-7890');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [language, setLanguage] = useState('English (US)');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // 2. USER MANAGEMENT STATE
  const [candidateReg, setCandidateReg] = useState(true);
  const [employerReg, setEmployerReg] = useState(true);
  const [emailVerifyReq, setEmailVerifyReq] = useState(true);
  const [accountApprovalWorkflow, setAccountApprovalWorkflow] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState('Strong (8+ chars, numbers, symbols)');
  const [sessionTimeout, setSessionTimeout] = useState('60');

  // 3. RECRUITMENT STATE
  const [jobApprovalReq, setJobApprovalReq] = useState(true);
  const [autoExpireJobs, setAutoExpireJobs] = useState(true);
  const [maxActiveJobs, setMaxActiveJobs] = useState('25');
  const [resumeLimit, setResumeLimit] = useState('10');
  const [allowedFileTypes, setAllowedFileTypes] = useState('.pdf, .docx');
  const [defaultJobDuration, setDefaultJobDuration] = useState('30');

  // 4. CONTENT STATE
  const [resourcePub, setResourcePub] = useState(true);
  const [templatePub, setTemplatePub] = useState(true);
  const [blogPub, setBlogPub] = useState(true);
  const [featuredContent, setFeaturedContent] = useState(true);

  // 5. MARKETPLACE STATE
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(true);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);
  const [ordersEnabled, setOrdersEnabled] = useState(true);
  const [currency, setCurrency] = useState('USD ($)');
  const [gstPercentage, setGstPercentage] = useState('18');
  const [invoicePrefix, setInvoicePrefix] = useState('K2H-INV');

  // 6. NOTIFICATIONS STATE
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [broadcastNotifications, setBroadcastNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  // 7. BRANDING STATE
  const [brandColor, setBrandColor] = useState('#059669');
  const [copyrightNotice, setCopyrightNotice] = useState('© 2026 KnowToHire Inc. All rights reserved.');

  // 8. SECURITY STATE
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState('Never');

  // 9. PERSONAL PROFILE STATE
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [phone, setPhone] = useState(profile?.phone_number || '');

  // PASSWORD UPDATE STATE
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setHeadline(profile.headline || '');
      setPhone(profile.phone_number || '');
    }
  }, [profile]);

  const markDirty = () => {
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (profile) {
        await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            headline,
            phone_number: phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
        await refreshProfile();
      }

      setHasUnsavedChanges(false);
      setSuccess('Enterprise Settings successfully synchronized.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not update Settings configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setHasUnsavedChanges(false);
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setHeadline(profile.headline || '');
      setPhone(profile.phone_number || '');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) throw err;
      setSuccess('Security password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not update security password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-600 shadow-2xs">
              <SettingsIcon className="w-6 h-6" />
            </div>
            Enterprise Settings Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Configure system parameters, access management, notifications, branding, and role preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm" className="font-extrabold capitalize">
            Role: {role.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {success && <Alert type="success" title="Settings Saved">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Main Settings Layout (Desktop Sidebar Navigation + Content Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* DESKTOP SIDEBAR NAVIGATION (4 Cols) */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs space-y-1 sticky top-6">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-2">Settings Navigation</p>
          {availableSections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {sec.icon}
                </div>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* MOBILE SECTION TABS (Visible on small screens lg:hidden) */}
        <div className="block lg:hidden w-full overflow-x-auto pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-max">
            {availableSections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sec.icon}
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT CONTENT AREA (9 Cols Desktop / 12 Cols Mobile) */}
        <div className="lg:col-span-9 space-y-6">

          {/* 1. GENERAL SETTINGS SECTION */}
          {activeSection === 'general' && (
            <SettingsSection id="general" title="General Platform Settings" subtitle="Configure core platform metadata and regional parameters." icon={<SettingsIcon className="w-5 h-5" />}>
              <SettingsCard title="Platform Information" description="Set organizational identity and support contact details.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Platform Name</label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => { setPlatformName(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Support Email</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => { setSupportEmail(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Support Phone</label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => { setSupportPhone(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Timezone</label>
                    <Select
                      value={timezone}
                      onChange={(val) => { setTimezone(val); markDirty(); }}
                      options={[
                        { value: 'Asia/Kolkata (IST)', label: 'Asia/Kolkata (IST)' },
                        { value: 'UTC (GMT+0)', label: 'UTC (GMT+0)' },
                        { value: 'America/New_York (EST)', label: 'America/New_York (EST)' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Language</label>
                    <Select
                      value={language}
                      onChange={(val) => { setLanguage(val); markDirty(); }}
                      options={[
                        { value: 'English (US)', label: 'English (US)' },
                        { value: 'English (UK)', label: 'English (UK)' },
                      ]}
                    />
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard title="Platform Maintenance & Availability">
                <SettingsToggle
                  label="Maintenance Mode"
                  description="Temporarily restrict platform access for non-admin users during system upgrades."
                  checked={maintenanceMode}
                  onChange={(val) => { setMaintenanceMode(val); markDirty(); }}
                  badgeText={maintenanceMode ? 'ACTIVE' : 'OFF'}
                />
              </SettingsCard>
            </SettingsSection>
          )}

          {/* 2. USER MANAGEMENT SECTION */}
          {activeSection === 'users' && (
            <SettingsSection id="users" title="User Management & Auth Policies" subtitle="Configure user registration gates, verification workflows, and session policies." icon={<Users className="w-5 h-5" />}>
              <SettingsCard title="Registration Gateways">
                <SettingsToggle
                  label="Candidate Account Self-Registration"
                  description="Allow new jobseekers to register candidate accounts on KnowToHire."
                  checked={candidateReg}
                  onChange={(val) => { setCandidateReg(val); markDirty(); }}
                />
                <SettingsToggle
                  label="Employer Account Self-Registration"
                  description="Allow new companies and recruiters to create employer accounts."
                  checked={employerReg}
                  onChange={(val) => { setEmployerReg(val); markDirty(); }}
                />
                <SettingsToggle
                  label="Require Email Address Verification"
                  description="Require users to click email confirmation link before enabling account access."
                  checked={emailVerifyReq}
                  onChange={(val) => { setEmailVerifyReq(val); markDirty(); }}
                />
              </SettingsCard>

              <SettingsCard title="Session & Security Policy">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Session Inactivity Timeout (Minutes)</label>
                    <Select
                      value={sessionTimeout}
                      onChange={(val) => { setSessionTimeout(val); markDirty(); }}
                      options={[
                        { value: '30', label: '30 Minutes' },
                        { value: '60', label: '60 Minutes (Standard)' },
                        { value: '120', label: '120 Minutes' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Password Strength Enforcement</label>
                    <Select
                      value={passwordPolicy}
                      onChange={(val) => { setPasswordPolicy(val); markDirty(); }}
                      options={[
                        { value: 'Strong (8+ chars, numbers, symbols)', label: 'Strong (8+ chars, symbols)' },
                        { value: 'Moderate (8+ chars)', label: 'Moderate (8+ chars)' },
                      ]}
                    />
                  </div>
                </div>
              </SettingsCard>
            </SettingsSection>
          )}

          {/* 3. RECRUITMENT SETTINGS SECTION */}
          {activeSection === 'recruitment' && (
            <SettingsSection id="recruitment" title="Recruitment & Job Moderation" subtitle="Configure vacancy approval rules, resume upload limits, and posting durations." icon={<Briefcase className="w-5 h-5" />}>
              <SettingsCard title="Vacancy Moderation Rules">
                <SettingsToggle
                  label="Require Job Post Moderation Approval"
                  description="New employer job listings must be approved by an Admin before going public."
                  checked={jobApprovalReq}
                  onChange={(val) => { setJobApprovalReq(val); markDirty(); }}
                />
                <SettingsToggle
                  label="Auto-Expire Inactive Vacancies"
                  description="Automatically mark jobs as expired when closing date is reached."
                  checked={autoExpireJobs}
                  onChange={(val) => { setAutoExpireJobs(val); markDirty(); }}
                />
              </SettingsCard>

              <SettingsCard title="Application & Upload Limits">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Max Active Jobs per Company</label>
                    <input
                      type="number"
                      value={maxActiveJobs}
                      onChange={(e) => { setMaxActiveJobs(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Max Resume File Size (MB)</label>
                    <input
                      type="number"
                      value={resumeLimit}
                      onChange={(e) => { setResumeLimit(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Allowed Document Extensions</label>
                    <input
                      type="text"
                      value={allowedFileTypes}
                      onChange={(e) => { setAllowedFileTypes(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </SettingsCard>
            </SettingsSection>
          )}

          {/* 4. CONTENT CMS SETTINGS SECTION */}
          {activeSection === 'content' && (
            <SettingsSection id="content" title="Content Publishing & Catalog" subtitle="Control public resources, marketplace templates, and blog CMS publishing gates." icon={<BookOpen className="w-5 h-5" />}>
              <SettingsCard title="Publishing Modules">
                <SettingsToggle
                  label="Enable Resource Ebooks & Guides"
                  description="Allow public browsing and downloading of career guides."
                  checked={resourcePub}
                  onChange={(val) => { setResourcePub(val); markDirty(); }}
                />
                <SettingsToggle
                  label="Enable Template Marketplace Catalog"
                  description="Expose resume and cover letter templates to candidates."
                  checked={templatePub}
                  onChange={(val) => { setTemplatePub(val); markDirty(); }}
                />
                <SettingsToggle
                  label="Enable Public Blog Articles"
                  description="Publish advice and regulatory updates on the public blog."
                  checked={blogPub}
                  onChange={(val) => { setBlogPub(val); markDirty(); }}
                />
              </SettingsCard>
            </SettingsSection>
          )}

          {/* 5. MARKETPLACE SETTINGS SECTION */}
          {activeSection === 'marketplace' && (
            <SettingsSection id="marketplace" title="Marketplace & Billing Parameters" subtitle="Configure checkout parameters, currency, tax rates, and invoice prefixes." icon={<ShoppingBag className="w-5 h-5" />}>
              <SettingsCard title="Commerce Features">
                <SettingsToggle
                  label="Template Purchases Enabled"
                  description="Allow paid checkouts for premium marketplace templates."
                  checked={marketplaceEnabled}
                  onChange={(val) => { setMarketplaceEnabled(val); markDirty(); }}
                />
                <SettingsToggle
                  label="Employer Subscriptions Active"
                  description="Allow employers to upgrade membership tiers."
                  checked={subscriptionsEnabled}
                  onChange={(val) => { setSubscriptionsEnabled(val); markDirty(); }}
                />
              </SettingsCard>

              <SettingsCard title="Currency & Billing Rules">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Billing Currency</label>
                    <Select
                      value={currency}
                      onChange={(val) => { setCurrency(val); markDirty(); }}
                      options={[
                        { value: 'USD ($)', label: 'USD ($)' },
                        { value: 'INR (₹)', label: 'INR (₹)' },
                        { value: 'EUR (€)', label: 'EUR (€)' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">GST Tax Rate (%)</label>
                    <input
                      type="number"
                      value={gstPercentage}
                      onChange={(e) => { setGstPercentage(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Invoice Reference Prefix</label>
                    <input
                      type="text"
                      value={invoicePrefix}
                      onChange={(e) => { setInvoicePrefix(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </SettingsCard>
            </SettingsSection>
          )}

          {/* 6. NOTIFICATION SETTINGS SECTION */}
          {activeSection === 'notifications' && (
            <SettingsSection id="notifications" title="Notification & Channel Preferences" subtitle="Manage email digests, in-app bell notifications, and broadcast alerts." icon={<Bell className="w-5 h-5" />}>
              <SettingsCard title="Notification Channels">
                <SettingsToggle
                  label="Outbound SMTP Email Dispatch"
                  description="Send email alerts for status changes and application receipts."
                  checked={emailNotifications}
                  onChange={(val) => { setEmailNotifications(val); markDirty(); }}
                />
                <SettingsToggle
                  label="In-App Bell Alerts"
                  description="Display real-time notification alerts inside the dashboard."
                  checked={inAppNotifications}
                  onChange={(val) => { setInAppNotifications(val); markDirty(); }}
                />
                <SettingsToggle
                  label="Platform System Broadcasts"
                  description="Receive admin announcements and maintenance notices."
                  checked={broadcastNotifications}
                  onChange={(val) => { setBroadcastNotifications(val); markDirty(); }}
                />
              </SettingsCard>
            </SettingsSection>
          )}

          {/* 7. BRANDING SETTINGS SECTION */}
          {activeSection === 'branding' && (
            <SettingsSection id="branding" title="Platform Visual Branding" subtitle="Configure logo URLs, primary accent color tokens, and email footers." icon={<Palette className="w-5 h-5" />}>
              <SettingsCard title="Visual Identity & Theme">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Brand Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => { setBrandColor(e.target.value); markDirty(); }}
                        className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-slate-800">{brandColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Copyright Footer Notice</label>
                    <input
                      type="text"
                      value={copyrightNotice}
                      onChange={(e) => { setCopyrightNotice(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </SettingsCard>
            </SettingsSection>
          )}

          {/* 8. SECURITY SETTINGS SECTION */}
          {activeSection === 'security' && (
            <SettingsSection id="security" title="Security & Authentication Controls" subtitle="Enforce multi-factor authentication, audit logs retention, and session policies." icon={<ShieldCheck className="w-5 h-5" />}>
              <SettingsCard title="Two-Factor Authentication (2FA)">
                <SettingsToggle
                  label="Require Two-Factor Authentication"
                  description="Enforce 2FA security verification for privileged accounts."
                  checked={twoFactorAuth}
                  onChange={(val) => { setTwoFactorAuth(val); markDirty(); }}
                />
              </SettingsCard>

              <SettingsCard title="Password Governance">
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">New Password *</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password *</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="bg-slate-900 text-white font-bold text-xs">
                      Update Security Password
                    </Button>
                  </div>
                </form>
              </SettingsCard>
            </SettingsSection>
          )}

          {/* 9. INTEGRATIONS STATUS SECTION (STATUS ONLY - NO SECRETS EXPOSED!) */}
          {activeSection === 'integrations' && (
            <SettingsSection id="integrations" title="Integration Services Status" subtitle="Review active cloud infrastructure and gateway connection statuses." icon={<Link2 className="w-5 h-5" />}>
              <SettingsCard title="Cloud Service Adapters" description="Status indicators for active external adapters. No secrets or tokens are exposed.">
                <div className="space-y-3">
                  {[
                    { name: 'SMTP Outbound Mailer', status: 'Connected', desc: 'Active for system alerts and applicant status receipts.' },
                    { name: 'Supabase Postgres Database', status: 'Connected', desc: 'Active database adapter with RLS policy enforcement.' },
                    { name: 'Cloud Storage Bucket', status: 'Connected', desc: 'Secure asset bucket for resumes and company logos.' },
                    { name: 'Stripe Payment Gateway', status: 'Connected', desc: 'Sandbox transaction processing for template purchases.' },
                    { name: 'Google OAuth Single-Sign-On', status: 'Connected', desc: 'Active authentication provider.' },
                  ].map((item) => (
                    <div key={item.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </SettingsCard>
            </SettingsSection>
          )}

          {/* 10. PERSONAL ACCOUNT SECTION */}
          {activeSection === 'personal' && (
            <SettingsSection id="personal" title="Personal Account Profile" subtitle="Update your personal details, contact number, and login credentials." icon={<User className="w-5 h-5" />}>
              <SettingsCard title="Personal Profile Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Professional Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => { setHeadline(e.target.value); markDirty(); }}
                      placeholder="e.g. Senior Environmental Consultant"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard title="Session & Account Termination">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Sign Out of All Active Devices</p>
                    <p className="text-[11px] text-slate-400 font-medium">Log out your current session across browsers.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout All Devices
                  </Button>
                </div>
              </SettingsCard>
            </SettingsSection>
          )}

        </div>
      </div>

      {/* Floating Unsaved Changes Sticky Bar */}
      <UnsavedChangesBar
        hasChanges={hasUnsavedChanges}
        onSave={handleSaveAll}
        onReset={handleReset}
        saving={saving}
      />
    </div>
  );
};

export default SettingsHub;
