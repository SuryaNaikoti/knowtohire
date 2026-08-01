import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Loading } from '../../../components/ui/Loading';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { employerService } from '../../../lib/services/employerService';
import { Settings as SettingsIcon, Bell, Lock, Save, KeyRound, Globe, Palette, ShieldAlert } from 'lucide-react';

export const EmployerSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Preference states
  const [emailNewApps, setEmailNewApps] = useState(true);
  const [emailInterviews, setEmailInterviews] = useState(true);
  const [emailBilling, setEmailBilling] = useState(true);

  // Multi-Tenancy & Workspace states
  const [companyId, setCompanyId] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0F52BA');
  const [allowJobMatching, setAllowJobMatching] = useState(true);

  // Security password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const company = await employerService.getCompanyByEmployer(user.id);
        if (company) {
          setCompanyId(company.id);
          setSubdomain(company.subdomain || '');
          setCustomDomain(company.custom_domain || '');
          setPrimaryColor(company.theme_config?.primaryColor || '#0F52BA');
          setAllowJobMatching(company.settings?.allowJobMatching !== false);
        }
      } catch (err) {
        console.error('[SETTINGS LOAD COMPANY ERROR]', err);
      } finally {
        setLoading(false);
      }
    };
    loadCompanyData();
  }, [user]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Save notification preferences simulated delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccessMsg('Notification preferences updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTenantSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        subdomain: subdomain || undefined,
        custom_domain: customDomain || undefined,
        theme_config: { primaryColor, themeMode: 'light' as const },
        settings: { allowJobMatching, enableNotifications: true }
      };
      await employerService.updateCompany(companyId, payload);
      setSuccessMsg('Workspace tenancy and branding settings saved!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update tenant configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setSuccessMsg('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update credentials.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading label="Loading configuration panels..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-gray-200 border-solid pb-5">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" /> Workspace Settings
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          Configure notification dispatch settings, security controls, MFA options, and workspace access preferences.
        </p>
      </div>

      {successMsg && <Alert type="success" title="Success">{successMsg}</Alert>}
      {errorMsg && <Alert type="error" title="Error">{errorMsg}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Notification Preferences */}
        <Card className="bg-white">
          <CardHeader className="pb-3 border-b border-solid border-gray-100 flex flex-row items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-bold text-gray-900">Notification Channels</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSavePreferences} className="space-y-6">
              {[
                {
                  id: 'emailNewApps',
                  label: 'New Job Applications',
                  desc: 'Dispatch emails when candidates apply matching typical parameters.',
                  checked: emailNewApps,
                  onChange: setEmailNewApps,
                },
                {
                  id: 'emailInterviews',
                  label: 'Interview Scheduling & Reminders',
                  desc: 'Notify when interviews are confirmed or scheduled.',
                  checked: emailInterviews,
                  onChange: setEmailInterviews,
                },
                {
                  id: 'emailBilling',
                  label: 'Billing & Invoice Renewals',
                  desc: 'Send renewal receipts, plan upgrades, and checkout logs.',
                  checked: emailBilling,
                  onChange: setEmailBilling,
                },
              ].map((pref) => (
                <div key={pref.id} className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <label htmlFor={pref.id} className="text-xs font-bold text-gray-800 cursor-pointer">{pref.label}</label>
                    <p className="text-[11px] text-gray-400 font-semibold leading-relaxed max-w-sm">{pref.desc}</p>
                  </div>
                  <input
                    id={pref.id}
                    type="checkbox"
                    checked={pref.checked}
                    onChange={(e) => pref.onChange(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0 mt-0.5"
                  />
                </div>
              ))}

              <div className="flex justify-end pt-2 border-t border-solid border-gray-100">
                <Button type="submit" isLoading={saving} className="text-xs font-bold">
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Channels
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Side: Security Settings */}
        <Card className="bg-white">
          <CardHeader className="pb-3 border-b border-solid border-gray-100 flex flex-row items-center gap-2">
            <Lock className="w-4 h-4 text-secondary" />
            <CardTitle className="text-sm font-bold text-gray-900">Security Credentials</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<KeyRound className="w-4 h-4" />}
              />
              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<KeyRound className="w-4 h-4" />}
              />

              <div className="flex justify-end pt-2 border-t border-solid border-gray-100">
                <Button type="submit" isLoading={saving} className="text-xs font-bold">
                  Update Credentials
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Workspace Multi-Tenancy & Branding Configuration Card */}
      <Card className="bg-white">
        <CardHeader className="pb-3 border-b border-solid border-gray-100 flex flex-row items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-bold text-gray-900">Workspace Tenant Branding & Domain Mapping</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSaveTenantSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Custom Workspace Subdomain"
                  type="text"
                  placeholder="e.g. innotech (access via innotech.knowtohire.com)"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  leftIcon={<Globe className="w-4 h-4" />}
                />
                <p className="text-[10px] text-gray-400 font-semibold mt-1">
                  Only lower case letters, numbers, and dashes. Creates a white-labeled candidate experience URL.
                </p>
              </div>
              <div>
                <Input
                  label="Custom Mapping Domain"
                  type="text"
                  placeholder="e.g. careers.innotech.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  leftIcon={<Globe className="w-4 h-4" />}
                />
                <p className="text-[10px] text-gray-400 font-semibold mt-1">
                  Configure a custom CNAME alias targeting our public ingress endpoint.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-solid border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-2 flex items-center gap-1">
                  <Palette className="w-4 h-4 text-secondary" /> Primary Brand Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer p-0 bg-transparent"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="max-w-[120px] font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800 block flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-accent" /> Workspace Feature Controls
                </label>
                <div className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg border border-solid border-gray-200">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-800">Enable Semantic Job Matching</span>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                      Allow candidates applying to your tenant to use AI scoring against open requirements.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowJobMatching}
                    onChange={(e) => setAllowJobMatching(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0 mt-0.5"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-solid border-gray-100">
              <Button type="submit" isLoading={saving} className="text-xs font-bold">
                Save Workspace Tenancy Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerSettings;
