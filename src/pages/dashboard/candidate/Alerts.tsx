import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { alertsService } from '../../../lib/services/alertsService';
import type { JobAlert } from '../../../lib/services/alertsService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { Modal } from '../../../components/ui/Modal';
import { Alert } from '../../../components/ui/Alert';
import { BellRing, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Mail } from 'lucide-react';

export const Alerts: React.FC = () => {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<JobAlert | null>(null);

  // Form states
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!profile) return;
    try {
      const data = await alertsService.getAlerts(profile.id);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  const handleOpenAdd = () => {
    setSelectedAlert(null);
    setKeywords('');
    setLocation('');
    setFrequency('daily');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (alert: JobAlert) => {
    setSelectedAlert(alert);
    setKeywords(alert.keywords || '');
    setLocation(alert.location || '');
    setFrequency(alert.frequency);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!keywords.trim()) {
      setFormError('Keyword/Role is required.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      if (selectedAlert) {
        await alertsService.upsertAlert({
          id: selectedAlert.id,
          candidate_id: profile.id,
          keywords: keywords.trim(),
          location: location.trim() || undefined,
          frequency,
          is_active: selectedAlert.is_active,
        });
      } else {
        await alertsService.upsertAlert({
          candidate_id: profile.id,
          keywords: keywords.trim(),
          location: location.trim() || undefined,
          frequency,
          is_active: true,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormError('Failed to save alert. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!profile || !window.confirm('Delete this job alert?')) return;
    try {
      await alertsService.deleteAlert(profile.id, alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (alert: JobAlert) => {
    if (!profile) return;
    try {
      await alertsService.toggleAlert(profile.id, alert.id, !alert.is_active);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, is_active: !alert.is_active } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loading label="Loading alerts..." />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-primary" /> Job Alerts
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Get email/system notifications as soon as matching jobs are posted.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="font-bold text-xs shrink-0 flex items-center gap-1.5 w-full md:w-auto justify-center">
          <Plus className="w-4 h-4" /> Create Alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <BellRing className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm font-bold text-gray-600">No job alerts configured.</p>
          <p className="text-xs text-gray-400 font-medium">Create alerts to automatically monitor new job postings matching your interests.</p>
          <Button onClick={handleOpenAdd} className="text-xs font-bold">
            Set Up Your First Alert
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`bg-white transition-all ${alert.is_active ? 'border-l-4 border-l-primary' : 'opacity-65'}`}>
              <CardContent className="p-5 flex justify-between gap-4 items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-heading font-black text-gray-900 text-sm leading-none">{alert.keywords}</h3>
                      {alert.location && (
                        <p className="text-[10px] text-gray-400 font-bold mt-1">Location: {alert.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                      {alert.frequency}
                    </span>
                    <span className={`text-[10px] font-black ${alert.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {alert.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleActive(alert)}
                    className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 transition cursor-pointer"
                    aria-label={alert.is_active ? 'Deactivate alert' : 'Activate alert'}
                  >
                    {alert.is_active ? (
                      <ToggleRight className="w-6 h-6 text-primary" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-300" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(alert)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-primary transition cursor-pointer"
                    aria-label="Edit alert"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer"
                    aria-label="Delete alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAlert ? 'Edit Job Alert' : 'Create Job Alert'}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <Alert type="error" title="Error">{formError}</Alert>}

          <Input
            label="Keyword / Role Title"
            required
            value={keywords}
            onChange={(e: any) => setKeywords(e.target.value)}
            placeholder="e.g. Frontend Engineer, Product Manager"
          />

          <Input
            label="Location (Optional)"
            value={location}
            onChange={(e: any) => setLocation(e.target.value)}
            placeholder="e.g. Remote, San Francisco"
          />

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 tracking-wide">
              Notification Frequency
            </label>
            <select
              value={frequency}
              onChange={(e: any) => setFrequency(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white border-solid outline-none cursor-pointer"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving} className="text-xs font-bold">
              {selectedAlert ? 'Save Changes' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Alerts;
