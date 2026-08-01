import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Settings as SettingsIcon, User, Lock, Mail } from 'lucide-react';

export const Settings: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [headline, setHeadline] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setHeadline(profile.headline || '');
      setPhone(profile.phone_number || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setError('');
    setSuccess('');
    setSavingProfile(true);

    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          headline: headline.trim(),
          phone_number: phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (err) throw err;
      
      await refreshProfile();
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error: err } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (err) throw err;

      setSuccess('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="border-b border-gray-200 border-solid pb-5">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" /> Account Settings
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          Manage your personal details, preferences, and security settings.
        </p>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}
      {success && <Alert type="success" title="Success">{success}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-solid border-gray-100 pb-3 flex flex-row items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-bold text-gray-800">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    required
                    value={firstName}
                    onChange={(e: any) => setFirstName(e.target.value)}
                  />
                  <Input
                    label="Last Name"
                    required
                    value={lastName}
                    onChange={(e: any) => setLastName(e.target.value)}
                  />
                </div>

                <Input
                  label="Professional Headline"
                  value={headline}
                  onChange={(e: any) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer | React & Node"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    disabled
                    value={user?.email || ''}
                    leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                  />
                  <Input
                    label="Phone Number"
                    value={phone}
                    onChange={(e: any) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={savingProfile} className="text-xs font-bold">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-solid border-gray-100 pb-3 flex flex-row items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-bold text-gray-800">Security & Password</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e: any) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />

                <div className="flex pt-2">
                  <Button type="submit" isLoading={updatingPassword} className="text-xs font-bold w-full">
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
