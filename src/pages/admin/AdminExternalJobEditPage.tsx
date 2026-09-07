import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  ExternalJobSection,
  ExternalJobStatus,
  CreateExternalJobInput,
  UpdateExternalJobInput,
} from '@/types/externalJob';
import {
  externalJobService,
  isValidHttpUrl,
  openExternalJobUrl,
} from '@/services/externalJobService';
import {
  ArrowLeft,
  Save,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Building2,
  MapPin,
  Trash2,
  Loader2,
} from 'lucide-react';

export interface AdminExternalJobEditPageProps {
  jobId?: string;
  onNavigate?: (path: string) => void;
}

export const AdminExternalJobEditPage: React.FC<AdminExternalJobEditPageProps> = ({
  jobId: propJobId,
  onNavigate,
}) => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const pathId = currentPath.startsWith('/admin/external-jobs/')
    ? currentPath.replace('/admin/external-jobs/', '').replace('/edit', '')
    : '';
  const id = propJobId || pathId;
  const isEditing = Boolean(id && id !== 'new' && id !== 'create');

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [section, setSection] = useState<ExternalJobSection>('latest');
  const [status, setStatus] = useState<ExternalJobStatus>('published');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [publishedFrom, setPublishedFrom] = useState('');
  const [publishedUntil, setPublishedUntil] = useState('');
  const [linkLabel, setLinkLabel] = useState('View Job');
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      externalJobService.getExternalJobById(id).then((res) => {
        if (res.data) {
          const job = res.data;
          setTitle(job.title || '');
          setRedirectUrl(job.redirect_url || '');
          setSection(job.section || 'latest');
          setStatus(job.status || 'draft');
          setCompanyName(job.company_name || '');
          setLocation(job.location || '');
          setDescription(job.description || '');
          setDisplayOrder(job.display_order ?? 0);
          setPublishedFrom(job.published_from ? job.published_from.split('T')[0] : '');
          setPublishedUntil(job.published_until ? job.published_until.split('T')[0] : '');
          setLinkLabel(job.link_label || 'View Job');
          setClickCount(job.click_count || 0);
        } else {
          setGeneralError('External job listing was not found.');
        }
        setIsLoading(false);
      });
    } else {
      setTitle('');
      setRedirectUrl('');
      setSection('latest');
      setStatus('published');
      setCompanyName('');
      setLocation('');
      setDescription('');
      setDisplayOrder(0);
      setPublishedFrom('');
      setPublishedUntil('');
      setLinkLabel('View Job');
      setIsLoading(false);
    }
    setUrlError(null);
    setGeneralError(null);
    setSuccessMessage(null);
  }, [isEditing, id]);

  const handleUrlBlur = () => {
    if (!redirectUrl.trim()) {
      setUrlError('Redirect URL is required.');
    } else if (!isValidHttpUrl(redirectUrl)) {
      setUrlError('Invalid URL. Must start with http:// or https://');
    } else {
      setUrlError(null);
    }
  };

  const handleTestRedirect = () => {
    if (!isValidHttpUrl(redirectUrl)) {
      setUrlError('Cannot test invalid URL. Must start with http:// or https://');
      return;
    }
    openExternalJobUrl(redirectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setGeneralError('Job title is required.');
      return;
    }

    if (!redirectUrl.trim()) {
      setUrlError('Redirect URL is required.');
      return;
    }

    if (!isValidHttpUrl(redirectUrl)) {
      setUrlError('Invalid redirect URL. Must start with http:// or https://');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        const updatePayload: UpdateExternalJobInput = {
          title: title.trim(),
          redirect_url: redirectUrl.trim(),
          section,
          status,
          company_name: companyName.trim() || undefined,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          display_order: Number(displayOrder) || 0,
          published_from: publishedFrom ? new Date(publishedFrom).toISOString() : null,
          published_until: publishedUntil ? new Date(publishedUntil).toISOString() : null,
          link_label: linkLabel.trim() || 'View Job',
        };
        await externalJobService.updateExternalJob(id, updatePayload);
        setSuccessMessage('Curated job listing updated successfully.');
      } else {
        const createPayload: CreateExternalJobInput = {
          title: title.trim(),
          redirect_url: redirectUrl.trim(),
          section,
          status,
          company_name: companyName.trim() || undefined,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          display_order: Number(displayOrder) || 0,
          published_from: publishedFrom ? new Date(publishedFrom).toISOString() : undefined,
          published_until: publishedUntil ? new Date(publishedUntil).toISOString() : undefined,
          link_label: linkLabel.trim() || 'View Job',
        };
        await externalJobService.createExternalJob(createPayload);
        setSuccessMessage('Curated job listing created and published.');
      }

      setTimeout(() => {
        if (onNavigate) {
          onNavigate('/admin/external-jobs');
        } else {
          window.location.href = '/admin/external-jobs';
        }
      }, 700);
    } catch (err: any) {
      setGeneralError(err?.message || 'Failed to save external job. Please review inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm(`Permanently delete this curated listing: "${title}"?`)) return;
    setIsSubmitting(true);
    try {
      await externalJobService.deleteExternalJob(id);
      if (onNavigate) {
        onNavigate('/admin/external-jobs');
      } else {
        window.location.href = '/admin/external-jobs';
      }
    } catch (err: any) {
      setGeneralError('Failed to delete job listing.');
      setIsSubmitting(false);
    }
  };

  const sectionLabels: Record<ExternalJobSection, string> = {
    latest: 'Latest Jobs',
    fresher: 'Fresher Jobs',
    walk_in: 'Walk-In Interviews',
  };

  return (
    <AdminShell
      title={isEditing ? 'Edit Curated Job Listing' : 'Add Curated External Job'}
      currentPath="/admin/external-jobs"
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {/* Top Header & Breadcrumb Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onNavigate) onNavigate('/admin/external-jobs');
                else window.location.href = '/admin/external-jobs';
              }}
              className="h-9 px-3 text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Listings
            </Button>
            <div>
              <h1 className="text-xl font-bold font-display text-kth-slate-900 tracking-tight">
                {isEditing ? 'Edit External Job' : 'Add New External Job'}
              </h1>
              <p className="text-xs text-kth-slate-500">
                Configure direct redirect links for curated roles shown on the homepage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="text-red-600 hover:bg-red-50 text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Listing
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="bg-kth-slate-900 hover:bg-kth-slate-800 text-white font-bold text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> {isEditing ? 'Save Changes' : 'Create & Publish'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {generalError && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{generalError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center text-kth-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-kth-slate-400" />
            Loading job details...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Fields Form Column */}
              <div className="lg:col-span-8 space-y-5">
                <Card className="p-5 border-kth-slate-200 bg-white space-y-4">
                  <h3 className="text-sm font-bold text-kth-slate-900 border-b border-kth-slate-100 pb-2.5">
                    Core Listing Attributes
                  </h3>

                  {/* Job Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-kth-slate-700 block">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Infineon Hiring 2026 for Graduate Trainee Role"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="text-xs font-medium"
                    />
                    <p className="text-[11px] text-kth-slate-400">
                      Clear, concise role title as displayed to candidates on the homepage.
                    </p>
                  </div>

                  {/* Redirect URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-kth-slate-700 block">
                      Redirect URL (External Job Link) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://company.com/careers/job/123"
                        value={redirectUrl}
                        onChange={(e) => {
                          setRedirectUrl(e.target.value);
                          if (urlError) setUrlError(null);
                        }}
                        onBlur={handleUrlBlur}
                        required
                        className={`text-xs font-mono flex-1 ${urlError ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleTestRedirect}
                        disabled={!redirectUrl.trim()}
                        className="text-xs shrink-0"
                        title="Test link in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Test Link
                      </Button>
                    </div>
                    {urlError ? (
                      <p className="text-[11px] text-red-600 font-medium">{urlError}</p>
                    ) : (
                      <p className="text-[11px] text-kth-slate-400">
                        Must start with http:// or https://. Visitors are forwarded here when clicked.
                      </p>
                    )}
                  </div>

                  {/* Section & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-kth-slate-700 block">
                        Homepage Column Section <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={section}
                        onChange={(e) => setSection(e.target.value as ExternalJobSection)}
                        options={[
                          { value: 'latest', label: 'Latest Jobs' },
                          { value: 'fresher', label: 'Fresher Jobs' },
                          { value: 'walk_in', label: 'Walk-In Interviews' },
                        ]}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-kth-slate-700 block">
                        Publishing Status <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ExternalJobStatus)}
                        options={[
                          { value: 'published', label: 'Published (Live)' },
                          { value: 'draft', label: 'Draft (Hidden)' },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Company & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-kth-slate-700 block">Company Name</label>
                      <Input
                        placeholder="e.g. Infineon Technologies"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-kth-slate-700 block">Location</label>
                      <Input
                        placeholder="e.g. Bengaluru, Karnataka"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Display Order & Link Label */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-kth-slate-700 block">
                        Display Order Priority
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                        className="text-xs font-mono"
                      />
                      <p className="text-[11px] text-kth-slate-400">
                        Lower numbers appear first (e.g. #1 before #2).
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-kth-slate-700 block">Button CTA Label</label>
                      <Input
                        placeholder="View Job"
                        value={linkLabel}
                        onChange={(e) => setLinkLabel(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Validity Window */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-kth-slate-700 block">
                        Published From (Optional)
                      </label>
                      <Input
                        type="date"
                        value={publishedFrom}
                        onChange={(e) => setPublishedFrom(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-kth-slate-700 block">
                        Auto-Expire Date (Optional)
                      </label>
                      <Input
                        type="date"
                        value={publishedUntil}
                        onChange={(e) => setPublishedUntil(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Short Summary Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-kth-slate-700 block">
                      Short Description / Highlights (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Brief overview of eligibility, batch criteria, or walk-in schedule..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-xs rounded-lg border border-kth-slate-200 p-2.5 text-kth-slate-800 focus:outline-none focus:ring-1 focus:ring-kth-slate-900 resize-none font-sans"
                    />
                  </div>
                </Card>
              </div>

              {/* Sidebar Preview Column */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="p-4 border-kth-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-kth-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-kth-slate-900">
                      <Eye className="w-3.5 h-3.5 text-kth-slate-500" />
                      <span>Live Homepage Simulation</span>
                    </div>
                    <Badge variant={status === 'published' ? 'emerald' : 'slate'} className="text-[10px]">
                      {status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-kth-slate-500">
                    Renders under the <strong>{sectionLabels[section]}</strong> column:
                  </p>

                  {/* Simulated Card */}
                  <div className="p-3.5 rounded-lg border border-kth-slate-200 bg-kth-slate-50/70 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-xs text-kth-slate-900 leading-snug line-clamp-2">
                        {title.trim() || 'Job Title Preview'}
                      </p>
                      <ExternalLink className="w-3 h-3 text-kth-slate-400 shrink-0 mt-0.5" />
                    </div>

                    {(companyName.trim() || location.trim()) && (
                      <div className="text-[11px] text-kth-slate-500 flex flex-wrap gap-x-2">
                        {companyName.trim() && (
                          <span className="flex items-center gap-1 font-semibold text-kth-slate-700">
                            <Building2 className="w-3 h-3 text-kth-slate-400" />
                            {companyName}
                          </span>
                        )}
                        {location.trim() && (
                          <span className="flex items-center gap-1 text-kth-slate-500">
                            <MapPin className="w-3 h-3 text-kth-slate-400" />
                            {location}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-kth-slate-200/60">
                      <span className="text-kth-primary-600 font-semibold">{linkLabel || 'View Job'} &rarr;</span>
                      <span className="font-mono text-[10px] text-kth-slate-400">Order: #{displayOrder}</span>
                    </div>
                  </div>

                  <div className="bg-kth-slate-50 p-2.5 rounded-md border border-kth-slate-100 text-[11px] text-kth-slate-500 space-y-1">
                    <div className="font-semibold text-kth-slate-700">Forwarding Destination:</div>
                    <div className="font-mono text-[10px] text-kth-slate-600 truncate">
                      {redirectUrl.trim() || 'https://...'}
                    </div>
                    {isEditing && (
                      <div className="text-kth-slate-500 pt-1">
                        Lifetime Impressions / Clicks: <strong className="text-kth-slate-800">{clickCount}</strong>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Quick Actions Card */}
                <Card className="p-4 border-kth-slate-200 bg-white space-y-3">
                  <h4 className="text-xs font-bold text-kth-slate-900">Submission Actions</h4>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-kth-slate-900 hover:bg-kth-slate-800 text-white font-bold text-xs h-9"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 mr-1.5" /> {isEditing ? 'Save Changes' : 'Create & Publish'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onNavigate) onNavigate('/admin/external-jobs');
                      else window.location.href = '/admin/external-jobs';
                    }}
                    className="w-full text-xs"
                  >
                    Cancel
                  </Button>
                </Card>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
};
