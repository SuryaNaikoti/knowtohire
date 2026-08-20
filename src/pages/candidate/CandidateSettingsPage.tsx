import React, { useState } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/context/AuthContext';
import { User, Bell, Shield, Lock, LogOut, AlertTriangle } from 'lucide-react';

export const CandidateSettingsPage: React.FC = () => {
  const { logout, profile, user } = useAuth();
  const [jobAlerts, setJobAlerts] = useState(true);
  const [appAlerts, setAppAlerts] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        {/* Account Details */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-kth-primary-600" /> Account Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" defaultValue={profile?.full_name || ''} />
            <Input label="Email Address" type="email" defaultValue={profile?.email || user?.email || ''} disabled />
            <Input label="Phone Number" defaultValue={profile?.phone || ''} />
            <Select
              label="Preferred Work Location"
              defaultValue="hyderabad"
              options={[
                { value: 'hyderabad', label: 'Hyderabad, TS' },
                { value: 'bengaluru', label: 'Bengaluru, KA' },
                { value: 'mumbai', label: 'Mumbai, MH' },
                { value: 'remote', label: 'Remote Only' },
              ]}
            />
          </div>
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
              <Switch checked={jobAlerts} onChange={setJobAlerts} />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-kth-slate-100">
              <div>
                <h4 className="font-bold text-xs text-kth-slate-900">Application Stage Updates</h4>
                <p className="text-xs text-kth-slate-500">Notifications when your application moves to interview or offer stage.</p>
              </div>
              <Switch checked={appAlerts} onChange={setAppAlerts} />
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
            <Switch checked={profileVisible} onChange={setProfileVisible} />
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
                Signed in as <span className="font-semibold text-kth-slate-700">{profile?.email || user?.email || 'Candidate Account'}</span>
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
          <p className="text-xs text-red-600 mb-4">Deactivating your candidate profile will remove your active applications from employer views.</p>
          <Button variant="destructive" size="sm">Deactivate Account</Button>
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
    </CandidateShell>
  );
};
