import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Settings as SettingsIcon, ToggleLeft, ToggleRight, Save, ShieldCheck } from 'lucide-react';

export const PlatformSettings: React.FC = () => {
  const [flags, setFlags] = useState({
    aiMatching: true,
    stripeSimulation: true,
    emailNotifications: true,
    candidateScouting: false,
    moderationQueue: true,
  });

  const [success, setSuccess] = useState('');

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setSuccess('Platform feature flags and system configuration synced successfully.');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="border-b border-gray-200 border-solid pb-5">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" /> Platform Settings
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          Configure active module toggles, modify system telemetry thresholds, and edit feature gates.
        </p>
      </div>

      {success && <Alert type="success" title="Settings Saved">{success}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-solid border-gray-100 pb-3 flex flex-row items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-bold text-gray-800">Global Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {[
                { key: 'aiMatching', label: 'AI Match Engine v2.0', desc: 'Runs semantic matching algorithms against active vacancies.' },
                { key: 'stripeSimulation', label: 'Stripe Sandbox Transactions', desc: 'Allows mock checkouts for template purchases.' },
                { key: 'emailNotifications', label: 'Outbound SMTP Mailer', desc: 'Sends confirmation logs and applicant status alerts.' },
                { key: 'candidateScouting', label: 'Talent Scout Public Beta', desc: 'Allows employers to search candidate portfolios.' },
                { key: 'moderationQueue', label: 'Ad-hoc Job Post Moderation', desc: 'Requires new job vacancies to be approved before publishing.' },
              ].map((flag) => {
                const isEnabled = flags[flag.key as keyof typeof flags];
                return (
                  <div key={flag.key} className="flex items-center justify-between gap-4 border-b border-solid border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-gray-800">{flag.label}</p>
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-md">{flag.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFlag(flag.key as keyof typeof flags)}
                      className="text-primary hover:text-indigo-650 transition cursor-pointer"
                    >
                      {isEnabled ? (
                        <ToggleRight className="w-9 h-9 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-gray-300" />
                      )}
                    </button>
                  </div>
                );
              })}

              <div className="flex justify-end pt-2 border-t border-solid border-gray-50">
                <Button onClick={handleSave} className="text-xs font-bold flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> Save System Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
