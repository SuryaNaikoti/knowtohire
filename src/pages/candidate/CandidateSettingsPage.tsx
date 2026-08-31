import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/context/AuthContext';
import { candidateProfileService } from '@/services/candidateProfileService';
import { taxonomyService, CityItem } from '@/services';
import {
  User,
  Bell,
  Shield,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface CandidateSettingsPageProps {
  onNavigate?: (path: string) => void;
}

export const CandidateSettingsPage: React.FC<CandidateSettingsPageProps> = ({ onNavigate }) => {
  const { logout, profile, user, refreshProfile } = useAuth();

  // Geography State
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('Hyderabad, Telangana');

  // Baseline Form State for dirty check
  const [initialFullName, setInitialFullName] = useState('');
  const [initialPhone, setInitialPhone] = useState('');
  const [initialPreferredLocation, setInitialPreferredLocation] = useState('Hyderabad, Telangana');

  // Toggle Preferences
  const [jobAlerts, setJobAlerts] = useState(true);
  const [appAlerts, setAppAlerts] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  // Status & Feedback States
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isUpdatingJobAlerts, setIsUpdatingJobAlerts] = useState(false);
  const [isUpdatingAppAlerts, setIsUpdatingAppAlerts] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  const [accountSuccessMsg, setAccountSuccessMsg] = useState<string | null>(null);
  const [accountErrorMsg, setAccountErrorMsg] = useState<string | null>(null);
  const [globalErrorMsg, setGlobalErrorMsg] = useState<string | null>(null);

  // Dialogs
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isAccountDeactivated, setIsAccountDeactivated] = useState(false);

  // Load canonical geography cities
  useEffect(() => {
    async function fetchCities() {
      const res = await taxonomyService.searchCities('', 'country-in');
      if (res.data && res.data.length > 0) {
        setCitiesList(res.data);
      }
    }
    fetchCities();
  }, []);

  // Load canonical profile & preferences
  const loadCandidateData = useCallback(async () => {
    setIsLoadingProfile(true);
    setGlobalErrorMsg(null);

    const { data, error } = await candidateProfileService.getMyCandidateProfile();
    if (error || !data) {
      // Fallback to auth context profile
      const name = profile?.full_name || '';
      const ph = profile?.phone || '';
      setFullName(name);
      setInitialFullName(name);
      setPhone(ph);
      setInitialPhone(ph);
    } else {
      const name = data.fullName || '';
      const ph = data.phone || '';
      const loc = data.location || 'Hyderabad, Telangana';

      setFullName(name);
      setInitialFullName(name);
      setPhone(ph);
      setInitialPhone(ph);
      setPreferredLocation(loc);
      setInitialPreferredLocation(loc);

      setJobAlerts(data.jobRecommendationAlerts !== undefined ? Boolean(data.jobRecommendationAlerts) : true);
      setAppAlerts(data.applicationStageUpdates !== undefined ? Boolean(data.applicationStageUpdates) : true);
      setProfileVisible(data.isDiscoverable !== undefined ? Boolean(data.isDiscoverable) : true);
      setIsAccountDeactivated(data.isActive === false || data.status === 'suspended');
    }

    setIsLoadingProfile(false);
  }, [profile]);

  useEffect(() => {
    loadCandidateData();
  }, [loadCandidateData]);

  // Dirty check for Account Information
  const isAccountDirty =
    fullName.trim() !== initialFullName.trim() ||
    phone.trim() !== initialPhone.trim() ||
    preferredLocation.trim() !== initialPreferredLocation.trim();

  // 1. Save Account Information
  const handleSaveAccountInfo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAccountErrorMsg(null);
    setAccountSuccessMsg(null);

    // Validation
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setAccountErrorMsg('Full name is required.');
      return;
    }
    if (trimmedName.length < 2) {
      setAccountErrorMsg('Full name must be at least 2 characters.');
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && trimmedPhone.length < 7) {
      setAccountErrorMsg('Please provide a valid phone number (at least 7 digits).');
      return;
    }

    const trimmedLocation = preferredLocation.trim() || 'Hyderabad, Telangana';

    setIsSavingAccount(true);
    const res = await candidateProfileService.updateMyCandidateProfile({
      fullName: trimmedName,
      phone: trimmedPhone || null,
      location: trimmedLocation,
    });
    setIsSavingAccount(false);

    if (res.error || !res.data) {
      setAccountErrorMsg(res.error?.message || 'Failed to save account information. Please try again.');
    } else {
      setAccountSuccessMsg('✓ Changes saved successfully');
      setInitialFullName(trimmedName);
      setInitialPhone(trimmedPhone);
      setInitialPreferredLocation(trimmedLocation);
      await refreshProfile();
      setTimeout(() => setAccountSuccessMsg(null), 4000);
    }
  };

  // 2. Toggle Job Recommendation Alerts
  const handleToggleJobAlerts = async (checked: boolean) => {
    setJobAlerts(checked);
    setIsUpdatingJobAlerts(true);
    setGlobalErrorMsg(null);

    const res = await candidateProfileService.updateMyCandidateProfile({
      jobRecommendationAlerts: checked,
    });
    setIsUpdatingJobAlerts(false);

    if (res.error) {
      setJobAlerts(!checked); // Rollback
      setGlobalErrorMsg('Failed to update Job Recommendation Alerts preference.');
    }
  };

  // 3. Toggle Application Stage Updates
  const handleToggleAppAlerts = async (checked: boolean) => {
    setAppAlerts(checked);
    setIsUpdatingAppAlerts(true);
    setGlobalErrorMsg(null);

    const res = await candidateProfileService.updateMyCandidateProfile({
      applicationStageUpdates: checked,
    });
    setIsUpdatingAppAlerts(false);

    if (res.error) {
      setAppAlerts(!checked); // Rollback
      setGlobalErrorMsg('Failed to update Application Stage Updates preference.');
    }
  };

  // 4. Toggle Profile Visibility & Discovery
  const handleToggleProfileVisibility = async (checked: boolean) => {
    setProfileVisible(checked);
    setIsUpdatingVisibility(true);
    setGlobalErrorMsg(null);

    const res = await candidateProfileService.updateMyCandidateProfile({
      isDiscoverable: checked,
    });
    setIsUpdatingVisibility(false);

    if (res.error) {
      setProfileVisible(!checked); // Rollback
      setGlobalErrorMsg('Unable to update profile visibility setting. Please try again.');
    }
  };

  // 5. Account Deactivation
  const handleDeactivateAccount = async () => {
    try {
      setIsDeactivating(true);
      setGlobalErrorMsg(null);

      // Apply authoritative candidate deactivation
      await candidateProfileService.deactivateMyAccount();

      setIsAccountDeactivated(true);
      setProfileVisible(false);
      setIsDeactivating(false);
      setIsDeactivateDialogOpen(false);

      // Sign out and redirect after deactivation
      await logout();
      if (onNavigate) {
        onNavigate('/login');
      } else {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new Event('popstate'));
      }
    } catch (err) {
      console.error('[CandidateSettingsPage] Deactivation error:', err);
      // Even if unexpected error, ensure local cleanup and redirect
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

  // 6. Sign Out
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new Event('popstate'));
    } catch (err) {
      console.error('[CandidateSettingsPage] Logout error:', err);
    } finally {
      setIsLoggingOut(false);
      setIsConfirmLogoutOpen(false);
    }
  };

  return (
    <CandidateShell title="Candidate Settings" currentPath="/candidate/settings">
      <div className="space-y-6">
        {/* Global Error Banner */}
        {globalErrorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{globalErrorMsg}</span>
            </div>
            <button
              onClick={() => setGlobalErrorMsg(null)}
              className="text-red-700 hover:text-red-900 font-bold px-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Account Details */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-kth-primary-600" /> Account Information
            </h3>
            {isLoadingProfile && (
              <Loader2 className="w-4 h-4 text-kth-slate-400 animate-spin" />
            )}
          </div>

          {accountSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{accountSuccessMsg}</span>
            </div>
          )}

          {accountErrorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{accountErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveAccountInfo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoadingProfile || isSavingAccount}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={profile?.email || user?.email || 'candidate@knowtohire.com'}
                disabled
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={isLoadingProfile || isSavingAccount}
              />
              <SearchableCombobox
                label="Preferred Work Location"
                value={preferredLocation}
                onChange={(val) => setPreferredLocation(val)}
                placeholder="Search canonical city (e.g. Hyderabad, Bengaluru, Pune)..."
                searchPlaceholder="Search city name..."
                options={citiesList.map((c) => ({
                  value: `${c.name}, India`,
                  label: `${c.name}, India`,
                  category: c.is_popular ? 'Metropolitan Hub' : 'Regional City',
                }))}
                disabled={isLoadingProfile || isSavingAccount}
              />
            </div>

            {/* Save Changes Button */}
            <div className="flex items-center justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!isAccountDirty || isSavingAccount || isLoadingProfile}
                isLoading={isSavingAccount}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-kth-accent-cyan" /> Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-kth-slate-900">Job Recommendation Alerts</h4>
                <p className="text-xs text-kth-slate-500">Receive alerts when new jobs match your 90%+ skill score.</p>
              </div>
              <div className="flex items-center gap-2">
                {isUpdatingJobAlerts && <Loader2 className="w-3.5 h-3.5 text-kth-slate-400 animate-spin" />}
                <Switch
                  checked={jobAlerts}
                  onChange={handleToggleJobAlerts}
                  disabled={isUpdatingJobAlerts || isLoadingProfile}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-kth-slate-100">
              <div>
                <h4 className="font-bold text-xs text-kth-slate-900">Application Stage Updates</h4>
                <p className="text-xs text-kth-slate-500">Notifications when your application moves to interview or offer stage.</p>
              </div>
              <div className="flex items-center gap-2">
                {isUpdatingAppAlerts && <Loader2 className="w-3.5 h-3.5 text-kth-slate-400 animate-spin" />}
                <Switch
                  checked={appAlerts}
                  onChange={handleToggleAppAlerts}
                  disabled={isUpdatingAppAlerts || isLoadingProfile}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy & Discovery */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-kth-accent-emerald" /> Profile Visibility & Discovery
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-kth-slate-900">Discoverable to Verified Employers</h4>
              <p className="text-xs text-kth-slate-500">Allow verified Indian enterprises to discover your profile in candidate searches.</p>
            </div>
            <div className="flex items-center gap-2">
              {isUpdatingVisibility && <Loader2 className="w-3.5 h-3.5 text-kth-slate-400 animate-spin" />}
              <Switch
                checked={profileVisible}
                onChange={handleToggleProfileVisibility}
                disabled={isUpdatingVisibility || isLoadingProfile}
              />
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
              <h4 className="font-bold text-xs text-kth-slate-900">Active Session</h4>
              <p className="text-xs text-kth-slate-500 mt-0.5">
                Signed in as <span className="font-semibold text-kth-slate-700">{profile?.email || user?.email || 'candidate@knowtohire.com'}</span>
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

        {/* Danger Zone */}
        <Card className="p-6 border-red-200 bg-red-50/20">
          <h3 className="font-display font-bold text-base text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" /> Danger Zone
          </h3>
          <p className="text-xs text-red-600 mb-4">
            {isAccountDeactivated
              ? 'Your account is currently deactivated. Your profile is hidden from all employer discovery searches.'
              : 'Deactivating your candidate profile will remove your active applications from employer views.'}
          </p>
          <Button
            variant="destructive"
            size="sm"
            disabled={isAccountDeactivated}
            onClick={() => setIsDeactivateDialogOpen(true)}
          >
            {isAccountDeactivated ? 'Account Deactivated' : 'Deactivate Account'}
          </Button>
        </Card>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <Dialog
        isOpen={isConfirmLogoutOpen}
        onClose={() => !isLoggingOut && setIsConfirmLogoutOpen(false)}
        title="Sign out of KnowToHire?"
        description="You'll need to sign in again to access your candidate portal."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-kth-slate-600">
            Are you sure you want to end your current session? Any unsaved changes in progress may be lost.
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

      {/* Deactivate Account Confirmation Dialog */}
      <Dialog
        isOpen={isDeactivateDialogOpen}
        onClose={() => !isDeactivating && setIsDeactivateDialogOpen(false)}
        title="Deactivate Candidate Account?"
        description="This action affects your visibility across KnowToHire."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Account Deactivation Consequences:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-red-800">
                <li>Your profile will immediately disappear from Employer Talent Discovery.</li>
                <li>Your active applications will be hidden from recruiter pipelines.</li>
                <li>Your historical records, interviews, and resume files are preserved safely.</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-kth-slate-600">
            Are you sure you want to proceed with deactivating your account? You will be signed out immediately.
          </p>

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
              leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
            >
              Deactivate Account
            </Button>
          </div>
        </div>
      </Dialog>
    </CandidateShell>
  );
};
