import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { candidateService } from '../../../lib/services/candidateService';
import type { CandidateCertification } from '../../../lib/services/candidateService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Award, Plus, Trash2, Edit2, ExternalLink, AlertTriangle, CheckCircle, Save, X } from 'lucide-react';
import { ProfileDraftService } from '../../../lib/services/ProfileDraftService';
import { analyticsService } from '../../../lib/services/analyticsService';

export const Certifications: React.FC = () => {
  const { profile } = useAuth();
  const [certs, setCerts] = useState<CandidateCertification[]>([]);
  const [loading, setLoading] = useState(true);

  // Form split panel states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CandidateCertification | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form fields state
  const [name, setName] = useState('');
  const [issuingOrg, setIssuingOrg] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const data = await candidateService.getCertifications(profile.id);
      setCerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  // Load draft from centralized ProfileDraftService
  useEffect(() => {
    if (!profile) return;
    const draft = ProfileDraftService.getDraft('certifications', profile.id);
    if (draft) {
      setName(draft.name || '');
      setIssuingOrg(draft.issuingOrg || '');
      setIssueDate(draft.issueDate || '');
      setExpirationDate(draft.expirationDate || '');
      setCredentialId(draft.credentialId || '');
      setCredentialUrl(draft.credentialUrl || '');
      setSelectedCert(draft.selectedCert || null);
      setIsFormOpen(true);
    }
  }, [profile]);

  // Centralized Autosave Trigger
  useEffect(() => {
    if (!profile || !isFormOpen) return;
    ProfileDraftService.saveDraft('certifications', profile.id, {
      name,
      issuingOrg,
      issueDate,
      expirationDate,
      credentialId,
      credentialUrl,
      selectedCert
    });
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Autosave Triggered', moduleName: 'certifications' }
    });
  }, [profile, isFormOpen, name, issuingOrg, issueDate, expirationDate, credentialId, credentialUrl, selectedCert]);

  const handleAdd = () => {
    setSelectedCert(null);
    setName('');
    setIssuingOrg('');
    setIssueDate('');
    setExpirationDate('');
    setCredentialId('');
    setCredentialUrl('');
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleEdit = (cert: CandidateCertification) => {
    setSelectedCert(cert);
    setName(cert.name);
    setIssuingOrg(cert.issuing_organization);
    setIssueDate(cert.issue_date || '');
    setExpirationDate(cert.expiration_date || '');
    setCredentialId(cert.credential_id || '');
    setCredentialUrl(cert.credential_url || '');
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    if (profile) {
      ProfileDraftService.clearDraft('certifications', profile.id);
    }
  };

  const handleDelete = async (certId: string) => {
    if (!profile || !window.confirm('Remove this certification?')) return;
    setDeleting(certId);
    setError('');
    setSuccess('');
    try {
      await candidateService.deleteCertification(profile.id, certId);
      setSuccess('Certification record removed successfully.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Certification Deleted', recordId: certId }
      });
      if (selectedCert?.id === certId) {
        setIsFormOpen(false);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Could not remove certification.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Validation checks
    if (!name.trim() || !issuingOrg.trim() || !issueDate) {
      setError('Please fill in all required fields.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Missing fields' }
      });
      return;
    }

    if (expirationDate && new Date(issueDate) > new Date(expirationDate)) {
      setError('Issue date must precede the expiration date.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Invalid date sequence' }
      });
      return;
    }

    // URL validation check if provided
    if (credentialUrl.trim() && !credentialUrl.startsWith('http://') && !credentialUrl.startsWith('https://')) {
      setError('Please enter a valid credential URL starting with http:// or https://');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Invalid URL' }
      });
      return;
    }

    // Duplicate entries validation check
    const isDuplicate = certs.some(c =>
      c.id !== selectedCert?.id &&
      c.name.toLowerCase().trim() === name.toLowerCase().trim() &&
      c.issuing_organization.toLowerCase().trim() === issuingOrg.toLowerCase().trim()
    );
    if (isDuplicate) {
      setError('A certification with this name from this organization already exists.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Duplicate entry' }
      });
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        id: selectedCert?.id,
        candidate_id: profile.id,
        name: name.trim(),
        issuing_organization: issuingOrg.trim(),
        issue_date: issueDate,
        expiration_date: expirationDate || null,
        credential_id: credentialId.trim() || null,
        credential_url: credentialUrl.trim() || null,
      };

      const ok = await candidateService.upsertCertification(payload as any);
      if (ok) {
        setSuccess('Certification saved successfully.');
        setIsFormOpen(false);
        ProfileDraftService.clearDraft('certifications', profile.id);

        analyticsService.track({
          event_type: 'click',
          event_category: 'auth',
          properties: { action: selectedCert ? 'Certification Edited' : 'Certification Added' }
        });

        fetchData();
      } else {
        setError('Failed to save certification details.');
        analyticsService.track({
          event_type: 'click',
          event_category: 'auth',
          properties: { action: 'Save Failed', reason: 'Database error' }
        });
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not write certification details.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Save Failed', reason: err.message }
      });
    } finally {
      setSaving(false);
    }
  };

  const getExpiryStatus = (expDate?: string | null) => {
    if (!expDate) return null;
    const exp = new Date(expDate);
    const now = new Date();
    const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { label: 'Expired', variant: 'error' as const, icon: 'expired' };
    if (daysLeft <= 60) return { label: `Expires in ${daysLeft}d`, variant: 'warning' as const, icon: 'warn' };
    return { label: `Expires ${exp.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`, variant: 'success' as const, icon: 'ok' };
  };

  if (loading && certs.length === 0) return <Loading label="Loading certifications..." />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Redesigned Breadcrumb + Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-secondary" /> Certifications & Credentials
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Showcase your professional certifications and credentials.
          </p>
        </div>
        {!isFormOpen && (
          <Button onClick={handleAdd} className="font-bold text-xs shrink-0 flex items-center gap-1.5 w-full md:w-auto justify-center">
            <Plus className="w-4 h-4" /> Add Certification
          </Button>
        )}
      </div>

      {error && <Alert type="error" title="Error Details">{error}</Alert>}
      {success && <Alert type="success" title="Action Completed">{success}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Certifications Cards */}
        <div className={`${isFormOpen ? 'lg:col-span-7' : 'lg:col-span-12'} grid grid-cols-1 md:grid-cols-2 gap-4`}>
          {certs.length === 0 ? (
            <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-7 h-7 text-amber-500" />
              </div>
              <p className="text-sm font-bold text-gray-600">No certifications added yet.</p>
              <p className="text-xs text-gray-400 font-medium">Certifications increase your profile strength and improve employer match scores.</p>
              <Button onClick={handleAdd} className="text-xs font-bold mx-auto">
                Add First Certification
              </Button>
            </div>
          ) : (
            certs.map((cert) => {
              const expiryStatus = getExpiryStatus(cert.expiration_date);
              return (
                <Card key={cert.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(cert)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-primary transition cursor-pointer"
                          aria-label="Edit certification"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id)}
                          disabled={deleting === cert.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                          aria-label="Delete certification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-heading font-black text-gray-900 text-sm leading-tight">{cert.name}</h3>
                      <p className="text-xs font-bold text-gray-600">{cert.issuing_organization}</p>
                      {cert.credential_id && (
                        <p className="text-[11px] text-gray-450 font-semibold">ID: {cert.credential_id}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {cert.issue_date && (
                        <span className="text-[11px] text-gray-500 font-semibold">
                          Issued: {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {expiryStatus && (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            expiryStatus.icon === 'expired'
                              ? 'bg-red-100 text-red-700'
                              : expiryStatus.icon === 'warn'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {expiryStatus.icon === 'expired' ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : expiryStatus.icon === 'warn' ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {expiryStatus.label}
                        </span>
                      )}
                    </div>

                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline pt-2 border-t border-solid border-gray-50 w-full"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Verify Credential
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Side: Split View Compact Form Panel */}
        {isFormOpen && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-solid border-gray-100 pb-3">
              <h3 className="font-heading font-black text-gray-900 text-sm">
                {selectedCert ? 'Modify Certification' : 'Create Certification'}
              </h3>
              <button
                onClick={handleCancelForm}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <Input
                label="Certification Name"
                placeholder="e.g. AWS Certified Solutions Architect"
                required
                maxLength={255}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Issuing Organization"
                placeholder="e.g. Amazon Web Services"
                required
                maxLength={255}
                value={issuingOrg}
                onChange={(e) => setIssuingOrg(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Issue Date"
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
                <Input
                  label="Expiration Date"
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Credential ID"
                  placeholder="e.g. AWS-12345"
                  maxLength={100}
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                />
                <Input
                  label="Credential URL"
                  type="url"
                  placeholder="e.g. https://verify.aws.com/12345"
                  maxLength={500}
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-solid border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}
                  disabled={saving}
                  size="sm"
                  className="text-xs font-bold bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={saving}
                  size="sm"
                  className="text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certifications;
