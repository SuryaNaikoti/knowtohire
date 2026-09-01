import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { JobCard } from '@/components/cards/JobCard';
import {
  companyProfileService,
  ExtendedCompanyProfile,
  jobService,
  Job,
} from '@/services';
import {
  MapPin,
  Users,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  ArrowLeft,
  Share2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export interface CompanyProfilePageProps {
  companyId?: string;
  onNavigate?: (path: string) => void;
}

export const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({
  companyId = 'default',
  onNavigate,
}) => {
  const [company, setCompany] = useState<ExtendedCompanyProfile | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [compRes, jobsRes] = await Promise.all([
      companyProfileService.getCompanyById(companyId),
      jobService.getPublishedJobs(),
    ]);

    if (compRes.data) {
      setCompany(compRes.data);
    } else {
      setErrorMessage(compRes.error?.message || 'Company profile not found.');
    }

    if (jobsRes.data?.data) {
      // Filter jobs belonging to this company or with matching company name
      const compName = compRes.data?.name?.toLowerCase() || '';
      const matchingJobs = jobsRes.data.data.filter((j: Job) => {
        if (j.company_id && compRes.data?.id && j.company_id === compRes.data.id) return true;
        const jName = j.company?.name || (j as any).company_name || '';
        return compName && jName.toLowerCase().includes(compName);
      });
      setCompanyJobs(matchingJobs);
    }

    setIsLoading(false);
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/jobs');
    } else {
      window.history.pushState({}, '', '/jobs');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 bg-kth-slate-50 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-5 w-32 bg-kth-slate-200 rounded animate-pulse" />
          <div className="bg-white p-8 rounded-2xl border border-kth-slate-200 space-y-6 animate-pulse">
            <div className="h-24 w-24 bg-kth-slate-200 rounded-2xl" />
            <div className="h-8 bg-kth-slate-200 rounded w-1/3" />
            <div className="h-4 bg-kth-slate-100 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !company) {
    return (
      <div className="py-16 bg-kth-slate-50 min-h-screen font-sans">
        <div className="max-w-lg mx-auto px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-kth-slate-900">
            Company Profile Not Found
          </h2>
          <p className="text-xs sm:text-sm text-kth-slate-500 leading-relaxed max-w-sm mx-auto">
            {errorMessage || 'The requested enterprise profile is currently unavailable or unverified.'}
          </p>
          <div className="pt-3">
            <Button variant="primary" size="md" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Explore Job Openings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-kth-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job Listings</span>
          </button>
        </div>

        {/* Company Header Hero Banner */}
        <Card className="p-6 sm:p-8 bg-white border border-kth-slate-200/90 rounded-2xl shadow-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-kth-primary-100 border border-indigo-200/70 text-indigo-700 flex items-center justify-center font-display font-black text-2xl shrink-0 shadow-xs">
                {company.name.charAt(0)}
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kth-slate-900">
                    {company.name}
                  </h1>
                  {company.verification_status === 'verified' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Enterprise
                    </span>
                  )}
                </div>

                {company.legal_name && company.legal_name !== company.name && (
                  <p className="text-xs text-kth-slate-500 font-medium">{company.legal_name}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-kth-slate-600 flex-wrap pt-1">
                  <span className="flex items-center gap-1.5 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    <Briefcase className="w-3.5 h-3.5" /> {company.industry || 'Technology & Advisory'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-kth-slate-400" /> {company.headquarters_location || 'India'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-kth-slate-400" /> {company.company_size || '51-200 Employees'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
                className="text-xs font-semibold"
              >
                {isCopied ? 'Link Copied!' : 'Share Profile'}
              </Button>
              {company.website_url && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const url = company.website_url?.startsWith('http')
                      ? company.website_url
                      : `https://${company.website_url}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Visit Website
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* About Enterprise */}
            <Card className="p-6 sm:p-8 bg-white border border-kth-slate-200/90 rounded-2xl shadow-xs space-y-4">
              <h2 className="font-display font-bold text-lg text-kth-slate-900 border-b border-kth-slate-100 pb-3">
                About the Enterprise
              </h2>
              <p className="text-xs sm:text-sm text-kth-slate-700 leading-relaxed whitespace-pre-line font-normal">
                {company.description ||
                  `${company.name} is a verified organization hiring professional talent on KnowToHire.`}
              </p>

              {/* Culture & Benefits */}
              {company.culture_benefits && company.culture_benefits.length > 0 && (
                <div className="pt-4 border-t border-kth-slate-100 space-y-3">
                  <h3 className="font-display font-bold text-sm text-kth-slate-900 uppercase tracking-wider">
                    Work Culture & Key Benefits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {company.culture_benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-kth-slate-700 bg-kth-slate-50 p-2.5 rounded-xl border border-kth-slate-100"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Active Open Positions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-extrabold text-xl text-kth-slate-900">
                  Open Positions ({companyJobs.length})
                </h2>
              </div>

              {companyJobs.length > 0 ? (
                <div className="space-y-4">
                  {companyJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      id={job.id}
                      title={job.title}
                      company={company.name}
                      location={job.location}
                      isRemote={job.work_mode === 'remote'}
                      isVerified={job.is_verified || company.verification_status === 'verified'}
                      employmentType={(job.employment_type || 'full_time').replace('_', ' ')}
                      minSalaryINR={job.min_salary_inr || 0}
                      maxSalaryINR={job.max_salary_inr || 0}
                      skills={Array.isArray(job.skills) ? job.skills : []}
                      onApply={() => {
                        const target = `/jobs/${job.id}`;
                        if (onNavigate) {
                          onNavigate(target);
                        } else {
                          window.history.pushState({}, '', target);
                          window.dispatchEvent(new Event('popstate'));
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 bg-white border border-kth-slate-200 text-center space-y-3">
                  <Briefcase className="w-8 h-8 text-kth-slate-400 mx-auto" />
                  <h3 className="font-bold text-sm text-kth-slate-800">No Open Positions Currently</h3>
                  <p className="text-xs text-kth-slate-500 max-w-sm mx-auto">
                    This employer does not currently have active job openings. Check back later for new requisitions.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-5 sm:p-6 bg-white border border-kth-slate-200/90 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-bold text-sm text-kth-slate-900 border-b border-kth-slate-100 pb-3">
                Corporate Credentials
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-kth-slate-500">Corporate Entity:</span>
                  <span className="font-bold text-kth-slate-900 text-right truncate max-w-[170px]">
                    {company.name}
                  </span>
                </div>
                {company.registration_number && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-kth-slate-500">Corporate CIN / ID:</span>
                    <span className="font-mono font-semibold text-kth-slate-800 text-right">
                      {company.registration_number}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-kth-slate-500">Primary Industry:</span>
                  <span className="font-semibold text-kth-slate-900 text-right">{company.industry || 'Technology'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-kth-slate-500">Headquarters:</span>
                  <span className="font-semibold text-kth-slate-900 text-right">{company.headquarters_location || 'India'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-kth-slate-500">Enterprise Size:</span>
                  <span className="font-semibold text-kth-slate-900 text-right">{company.company_size || '51-200'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-kth-slate-500">Verification:</span>
                  <span className="font-bold text-emerald-700 capitalize text-right">
                    {company.verification_status || 'Verified'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
