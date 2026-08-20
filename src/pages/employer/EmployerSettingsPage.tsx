import React, { useState } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, Bell, Lock, LogOut, Check } from 'lucide-react';

export const EmployerSettingsPage: React.FC = () => {
  const { logout, profile, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [applicantAlerts, setApplicantAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAccount = async () => {
    if (!user) return;
    setIsSaving(true);
    await supabase.from('profiles').update({
      full_name: fullName.trim(),
      phone: phone.trim(),
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new Event('popstate'));
    } catch (err) {
      console.error('[EmployerSettingsPage] Logout error:', err);
    } finally {
      setIsLoggingOut(false);
      setIsConfirmLogoutOpen(false);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Talent Acquisition Lead"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
            <Input
              label="Work Email"
              type="email"
              value={profile?.email || user?.email || ''}
              disabled
            />
            <Input
              label="Account Role"
              value={profile?.role || 'employer'}
              disabled
            />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" isLoading={isSaving} onClick={handleSaveAccount}>
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
              <Switch checked={applicantAlerts} onChange={setApplicantAlerts} />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-kth-slate-100">
              <div>
                <h4 className="font-bold text-xs text-kth-slate-900">Interview Schedule Reminders</h4>
                <p className="text-xs text-kth-slate-500">Daily alerts for scheduled candidate rounds.</p>
              </div>
              <Switch checked={interviewReminders} onChange={setInterviewReminders} />
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
                Signed in as <span className="font-semibold text-kth-slate-700">{profile?.email || user?.email}</span>
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
    </EmployerShell>
  );
};
