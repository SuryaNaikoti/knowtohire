import React, { useState, useEffect } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User, Bell, Lock, LogOut, Check, AlertCircle, AlertTriangle } from 'lucide-react';

export interface EmployerSettingsPageProps {
  onNavigate?: (path: string) => void;
}

export const EmployerSettingsPage: React.FC<EmployerSettingsPageProps> = ({ onNavigate }) => {
  const { logout, profile, user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [initialFullName, setInitialFullName] = useState(profile?.full_name || '');
  const [initialPhone, setInitialPhone] = useState(profile?.phone || '');

  const [applicantAlerts, setApplicantAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);

  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Load preferences and sync profile
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
      setInitialFullName(profile.full_name);
    }
    if (profile?.phone) {
      setPhone(profile.phone);
      setInitialPhone(profile.phone);
    }

    // Load user-scoped notification preferences
    const userId = user?.id || '00000000-0000-0000-0000-000000000002';
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(`kth_employer_prefs_${userId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.applicantAlerts !== undefined) setApplicantAlerts(Boolean(parsed.applicantAlerts));
          if (parsed.interviewReminders !== undefined) setInterviewReminders(Boolean(parsed.interviewReminders));
        }
      } catch {
        // ignore
      }
    }
  }, [profile, user]);

  const saveLocalPrefs = (newAppAlerts: boolean, newIntAlerts: boolean) => {
    const userId = user?.id || '00000000-0000-0000-0000-000000000002';
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(`kth_employer_prefs_${userId}`, JSON.stringify({
          applicantAlerts: newAppAlerts,
          interviewReminders: newIntAlerts,
          updated_at: new Date().toISOString(),
        }));
      } catch {
        // ignore
      }
    }
  };

  const handleToggleApplicantAlerts = (checked: boolean) => {
    setApplicantAlerts(checked);
    saveLocalPrefs(checked, interviewReminders);
  };

  const handleToggleInterviewReminders = (checked: boolean) => {
    setInterviewReminders(checked);
    saveLocalPrefs(applicantAlerts, checked);
  };

  const handleSaveAccount = async () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const userId = user?.id || '00000000-0000-0000-0000-000000000002';

    // 1. Update local custom profile for instant offline/demo reflection
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(`kth_demo_profile_custom_${userId}`);
        const current = raw ? JSON.parse(raw) : {};
        current.full_name = trimmedName;
        current.phone = trimmedPhone || null;
        current.updated_at = new Date().toISOString();
        window.localStorage.setItem(`kth_demo_profile_custom_${userId}`, JSON.stringify(current));

        const storedAuth = window.localStorage.getItem('kth_demo_auth_session');
        if (storedAuth) {
          const authObj = JSON.parse(storedAuth);
          authObj.full_name = trimmedName;
          window.localStorage.setItem('kth_demo_auth_session', JSON.stringify(authObj));
        }
      } catch {
        // ignore
      }
    }

    // 2. Update real Supabase DB if session active
    if (isSupabaseConfigured() && user?.id) {
      try {
        await supabase.from('profiles').update({
          full_name: trimmedName,
          phone: trimmedPhone || null,
          updated_at: new Date().toISOString(),
        }).eq('id', user.id);
      } catch {
        // ignore
      }
    }

    // 3. Refresh context and trigger reactivity
    if (refreshProfile) {
      await refreshProfile();
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kth_profile_updated', { detail: { full_name: trimmedName } }));
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setInitialFullName(trimmedName);
    setInitialPhone(trimmedPhone);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancelAccount = () => {
    setFullName(initialFullName);
    setPhone(initialPhone);
    setErrorMessage(null);
  };

  const isAccountDirty = fullName.trim() !== initialFullName.trim() || phone.trim() !== initialPhone.trim();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('[EmployerSettingsPage] Logout error:', err);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setIsConfirmLogoutOpen(false);
    }
  };

  // Authoritative Employer Account Deactivation
  const handleDeactivateAccount = async () => {
    try {
      setIsDeactivating(true);
      const userId = user?.id || '00000000-0000-0000-0000-000000000002';

      // 1. Record suspended status override in localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem('kth_admin_user_status_overrides');
          const current = raw ? JSON.parse(raw) : {};
          current[userId] = 'suspended';
          if (userId === '00000000-0000-0000-0000-000000000002') {
            current['demo-employer-002'] = 'suspended';
          }
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

      // 2. Sign out and redirect to login
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('[EmployerSettingsPage] Deactivation error:', err);
      await logout();
      navigate('/login');
    } finally {
      setIsDeactivating(false);
      setIsDeactivateDialogOpen(false);
    }
  };

  return (
    <EmployerShell title="Employer ATS Settings" currentPath="/employer/settings">
      <div className="space-y-6 max-w-4xl mx-auto font-sans">
        {/* Account Details */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-kth-primary-600" /> Recruiter Account Info
            </h3>
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Account Updated
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Talent Acquisition Lead"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="+91 98765 43210"
            />
            <Input
              label="Work Email"
              type="email"
              value={profile?.email || user?.email || 'employer@knowtohire.com'}
              disabled
            />
            <Input
              label="Account Role"
              value={profile?.role || 'employer'}
              disabled
            />
          </div>
          <div className="flex justify-end gap-2.5">
            {isAccountDirty && (
              <Button variant="secondary" size="sm" onClick={handleCancelAccount}>
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSaveAccount}
              disabled={!isAccountDirty && !errorMessage}
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Hiring Notification Toggles */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-kth-accent-cyan" /> Recruitment Alerts
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-kth-slate-900">New Applicant Notifications</h4>
                <p className="text-xs text-kth-slate-500">Receive alerts when candidates apply to active jobs.</p>
              </div>
              <Switch checked={applicantAlerts} onChange={handleToggleApplicantAlerts} />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-kth-slate-100">
              <div>
                <h4 className="font-bold text-xs text-kth-slate-900">Interview Schedule Reminders</h4>
                <p className="text-xs text-kth-slate-500">Daily alerts for scheduled candidate rounds.</p>
              </div>
              <Switch checked={interviewReminders} onChange={handleToggleInterviewReminders} />
            </div>
          </div>
        </Card>

        {/* Account Security & Session Management */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-kth-primary-600" /> Account Security & Sessions
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-xs text-kth-slate-900">Active Recruiter Session</h4>
              <p className="text-xs text-kth-slate-500 mt-0.5">
                Signed in as <span className="font-semibold text-kth-slate-700">{profile?.email || user?.email || 'employer@knowtohire.com'}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmLogoutOpen(true)}
              leftIcon={<LogOut className="w-4 h-4 text-rose-500" />}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 hover:border-rose-300"
            >
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Danger Zone: Account Deactivation */}
        <Card className="p-6 border-rose-200 bg-rose-50/20">
          <h3 className="font-display font-bold text-base text-rose-950 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Danger Zone
          </h3>
          <p className="text-xs text-rose-800/80 mb-4">
            Deactivating your employer account will pause all active job postings and restrict recruiter access to applicant data.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeactivateDialogOpen(true)}
          >
            Deactivate Employer Account
          </Button>
        </Card>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <Dialog
        isOpen={isConfirmLogoutOpen}
        onClose={() => !isLoggingOut && setIsConfirmLogoutOpen(false)}
        title="Sign out of KnowToHire?"
        description="You'll need to sign in again to access your employer ATS portal."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-kth-slate-600">
            Are you sure you want to end your current session?
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isLoggingOut}
              onClick={() => setIsConfirmLogoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              isLoading={isLoggingOut}
              onClick={handleLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Employer Account Deactivation Confirmation Dialog */}
      <Dialog
        isOpen={isDeactivateDialogOpen}
        onClose={() => !isDeactivating && setIsDeactivateDialogOpen(false)}
        title="Deactivate Recruiter Account?"
        description="This action will pause your active job postings and end your current session."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Your company profile and applicant histories will remain archived securely. You can reactivate by contacting platform support.
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
              onClick={handleDeactivateAccount}
            >
              Confirm Deactivation
            </Button>
          </div>
        </div>
      </Dialog>
    </EmployerShell>
  );
};
