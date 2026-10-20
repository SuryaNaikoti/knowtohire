import React, { useState } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { jobService, taxonomyService, JobCreateInput, WorkMode, EmploymentType, ExperienceLevel, CareerCategory, CityItem } from '@/services';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { initiateRazorpayCheckout } from '@/services/payment/razorpayClient';
import { FEATURED_JOB_TIERS } from '@/services/payment/authoritativePricing';
import { formatINR } from '@/design-system/tokens';
import { Eye, Save, Send, AlertCircle, ArrowLeft, Sparkles, Zap, Star, ShieldCheck } from 'lucide-react';

export interface EmployerCreateJobPageProps {
  onNavigate?: (path: string) => void;
}

const JOB_FORM_DRAFT_KEY = 'kth_employer_job_draft';

export const EmployerCreateJobPage: React.FC<EmployerCreateJobPageProps> = ({ onNavigate }) => {
  // Load initial form state from sessionStorage if returning from preview
  const getInitialDraft = () => {
    try {
      const raw = sessionStorage.getItem(JOB_FORM_DRAFT_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  };

  const initialDraft = getInitialDraft();

  // Form State
  const [title, setTitle] = useState(initialDraft?.title || '');
  const [department, setDepartment] = useState(initialDraft?.department || '');
  const [category, setCategory] = useState(initialDraft?.category || 'General Careers');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialDraft?.selectedCategoryId || 'cat-general');
  const [workMode, setWorkMode] = useState<WorkMode>(initialDraft?.workMode || 'hybrid');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initialDraft?.employmentType || 'full_time');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(initialDraft?.experienceLevel || 'mid_level');
  const [location, setLocation] = useState(initialDraft?.location || 'Bengaluru, Karnataka');
  const [minSalary, setMinSalary] = useState(initialDraft?.minSalary || '1800000');
  const [maxSalary, setMaxSalary] = useState(initialDraft?.maxSalary || '2600000');
  const [description, setDescription] = useState(initialDraft?.description || '');
  const [responsibilitiesText, setResponsibilitiesText] = useState(initialDraft?.responsibilitiesText || '');
  const [requirementsText, setRequirementsText] = useState(initialDraft?.requirementsText || '');
  const [skillsText, setSkillsText] = useState(initialDraft?.skillsText || '');
  const [benefitsText, setBenefitsText] = useState(initialDraft?.benefitsText || 'Health Insurance, Performance Bonus, Learning Stipend');

  // Master Taxonomy State
  const [categoriesList, setCategoriesList] = useState<CareerCategory[]>([]);
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);
  const [rolesList, setRolesList] = useState<{ id: string; name: string; category?: string }[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [canonicalRoleName, setCanonicalRoleName] = useState<string | null>(null);
  const [canonicalRoleId, setCanonicalRoleId] = useState<string | null>(null);

  // Featured Job Monetization State
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initialDraft?.isFeatured));
  const [selectedFeaturedTierId, setSelectedFeaturedTierId] = useState<string>(initialDraft?.selectedFeaturedTierId || 'feat_job_7d');

  // UI state
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isActive } = useSubscription();
  const [postingLimit, setPostingLimit] = useState<{ canPost: boolean; activeCount: number; maxAllowed: number; reason?: string } | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { subscriptionEntitlementService } = await import('@/services/subscriptionEntitlementService');
        const check = await subscriptionEntitlementService.canPostJob();
        if (isMounted) setPostingLimit(check);
      } catch {
        // ignore
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-save form draft to sessionStorage so user never loses their entered data
  React.useEffect(() => {
    const draftPayload = {
      title,
      department,
      category,
      selectedCategoryId,
      workMode,
      employmentType,
      experienceLevel,
      location,
      minSalary,
      maxSalary,
      description,
      responsibilitiesText,
      requirementsText,
      skillsText,
      benefitsText,
      isFeatured,
      selectedFeaturedTierId,
    };
    try {
      sessionStorage.setItem(JOB_FORM_DRAFT_KEY, JSON.stringify(draftPayload));
    } catch {
      // ignore
    }
  }, [
    title,
    department,
    category,
    selectedCategoryId,
    workMode,
    employmentType,
    experienceLevel,
    location,
    minSalary,
    maxSalary,
    description,
    responsibilitiesText,
    requirementsText,
    skillsText,
    benefitsText,
    isFeatured,
    selectedFeaturedTierId,
  ]);

  React.useEffect(() => {
    async function fetchTaxonomy() {
      const [catsRes, citiesRes, rolesRes, funcsRes] = await Promise.all([
        taxonomyService.getCareerCategories(),
        taxonomyService.searchCities('', 'country-in'),
        taxonomyService.searchJobRoles(),
        taxonomyService.getFunctionalAreas(),
      ]);
      if (catsRes.data && catsRes.data.length > 0) {
        setCategoriesList(catsRes.data);
      }
      if (citiesRes.data && citiesRes.data.length > 0) {
        setCitiesList(citiesRes.data);
      }
      if (rolesRes.data && rolesRes.data.length > 0) {
        setRolesList(rolesRes.data.map((r) => ({ id: r.id, name: r.name, category: r.seniority_level ? r.seniority_level.replace('_', ' ') : 'General Role' })));
      }
      if (funcsRes.data && funcsRes.data.length > 0) {
        setDepartmentsList(funcsRes.data.map((f) => f.name));
      }
    }
    fetchTaxonomy();
  }, []);

  // Automatically resolve canonical job role alias as employer types title
  React.useEffect(() => {
    async function resolveRole() {
      if (title.trim().length >= 3) {
        const resolved = await taxonomyService.resolveJobRole(title);
        if (resolved) {
          setCanonicalRoleName(resolved.name);
          setCanonicalRoleId(resolved.id);
        } else {
          setCanonicalRoleName(null);
          setCanonicalRoleId(null);
        }
      } else {
        setCanonicalRoleName(null);
        setCanonicalRoleId(null);
      }
    }
    resolveRole();
  }, [title]);

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      setErrorMessage('Job title is required');
      return;
    }
    if (!department.trim()) {
      setErrorMessage('Department is required');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Job description is required');
      return;
    }

    const minSal = parseInt(minSalary, 10);
    if (isNaN(minSal) || minSal <= 0) {
      setErrorMessage('Please provide a valid minimum salary in INR');
      return;
    }

    const maxSal = parseInt(maxSalary, 10);
    if (isNaN(maxSal) || maxSal <= 0) {
      setErrorMessage('Please provide a valid maximum salary in INR');
      return;
    }

    if (maxSal < minSal) {
      setErrorMessage('Maximum salary cannot be less than minimum salary');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const responsibilities = responsibilitiesText
      .split('\n')
      .map((r: string) => r.trim())
      .filter((r: string) => r.length > 0);

    const requirements = requirementsText
      .split('\n')
      .map((r: string) => r.trim())
      .filter((r: string) => r.length > 0);

    const skills = skillsText
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const benefits = benefitsText
      .split(',')
      .map((b: string) => b.trim())
      .filter((b: string) => b.length > 0);

    // Calculate featured dates if opted
    const activeTier = FEATURED_JOB_TIERS.find((t) => t.id === selectedFeaturedTierId) || FEATURED_JOB_TIERS[0];
    const shouldFeature = isFeatured && status === 'published';
    const startDate = shouldFeature ? new Date().toISOString() : null;
    const endDate = shouldFeature
      ? new Date(Date.now() + activeTier.days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const payload: JobCreateInput = {
      title: title.trim(),
      department: department.trim() || 'General',
      category,
      career_category_id: selectedCategoryId,
      canonical_role_id: canonicalRoleId || undefined,
      work_mode: workMode,
      employment_type: employmentType,
      experience_level: experienceLevel,
      location: location.trim(),
      min_salary_inr: parseInt(minSalary, 10) || 0,
      max_salary_inr: parseInt(maxSalary, 10) || 0,
      description: description.trim(),
      responsibilities: responsibilities.length > 0 ? responsibilities : undefined,
      requirements: requirements.length > 0 ? requirements : undefined,
      skills: skills.length > 0 ? skills : undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      status,
      is_featured: shouldFeature,
      featured_start_date: startDate,
      featured_end_date: endDate,
      featured_duration_days: shouldFeature ? activeTier.days : null,
    };

    // If employer opted for Featured Job and is publishing, prompt secure Razorpay Checkout
    if (shouldFeature) {
      try {
        await initiateRazorpayCheckout({
          amountINR: activeTier.priceINR,
          name: 'KnowToHire Priority Hiring',
          description: `${activeTier.label} Featured Job Boost for "${title.trim()}"`,
          itemId: activeTier.id,
          itemType: 'featured_job',
          receipt: `job_feat_${Date.now()}`,
          userId: user?.id,
          prefill: {
            name: user?.user_metadata?.full_name || 'Hiring Manager',
            email: user?.email || '',
          },
          onSuccess: async (_paymentResult: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            // Payment verified; now persist the published featured job
            const { data, error } = await jobService.createJob({
              ...payload,
              is_featured: true,
              featured_start_date: startDate,
              featured_end_date: endDate,
              featured_duration_days: activeTier.days,
            });

            setIsSubmitting(false);

            if (error) {
              setErrorMessage(error.message);
            } else if (data) {
              sessionStorage.removeItem(JOB_FORM_DRAFT_KEY);
              sessionStorage.removeItem('kth_job_preview_data');
              if (onNavigate) {
                onNavigate('/employer/jobs');
              } else {
                window.location.href = '/employer/jobs';
              }
            }
          },
          onDismiss: () => {
            setIsSubmitting(false);
          },
          onError: (err: Error) => {
            setIsSubmitting(false);
            setErrorMessage(err.message || 'Payment for featured placement was unsuccessful. The job has not been published.');
          },
        });
        return;
      } catch (checkoutErr: any) {
        setIsSubmitting(false);
        setErrorMessage(checkoutErr?.message || 'Unable to initiate payment for featured job.');
        return;
      }
    }

    const { data, error } = await jobService.createJob(payload);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
    } else if (data) {
      // Clear saved draft on successful job creation
      sessionStorage.removeItem(JOB_FORM_DRAFT_KEY);
      sessionStorage.removeItem('kth_job_preview_data');
      if (onNavigate) {
        onNavigate('/employer/jobs');
      } else {
        window.location.href = '/employer/jobs';
      }
    }
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <EmployerShell title="Post a New Job Opening" currentPath="/employer/jobs">
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        {/* Back Link */}
        <div>
          <button
            type="button"
            onClick={() => handleNavigate('/employer/jobs')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job Openings</span>
          </button>
        </div>

        {/* Entitlement Status Banner */}
        {!isActive && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Free Employer Tier</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                    {postingLimit ? `${postingLimit.activeCount} of ${postingLimit.maxAllowed} free jobs used` : '2 Free Jobs Included'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  You can post up to 2 active jobs without any subscription. Looking for Kanban ATS, candidate comparisons, or AI ranking?
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold"
              onClick={() => handleNavigate('/pricing')}
            >
              View Paid Plans
            </Button>
          </div>
        )}

        {errorMessage && (
          <Alert variant="error" title="Validation Error">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          </Alert>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave('published'); }} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-kth-slate-900 border-b border-kth-slate-100 pb-2">
              1. Basic Role Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SearchableCombobox
                  label="Job Title"
                  placeholder="Select a role or enter custom title..."
                  searchPlaceholder="Search role or type custom..."
                  customPlaceholder="e.g. Lead Climate Strategist / Senior Architect"
                  value={title}
                  onChange={(val) => setTitle(val)}
                  options={rolesList.map((r) => ({
                    value: r.name,
                    label: r.name,
                    category: r.category,
                  }))}
                  allowCustom={true}
                  required
                />
                {canonicalRoleName && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Canonical Role: <strong>{canonicalRoleName}</strong></span>
                  </div>
                )}
              </div>
              <SearchableCombobox
                label="Department"
                placeholder="Select department or enter custom..."
                searchPlaceholder="Search department or type custom..."
                customPlaceholder="e.g. Special Advisory / Product R&D"
                value={department}
                onChange={(val) => setDepartment(val)}
                options={departmentsList.map((dept) => ({
                  value: dept,
                  label: dept,
                }))}
                allowCustom={true}
                required
              />
              <Select
                label="Career Category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const match = categoriesList.find((c) => c.name === e.target.value);
                  if (match) setSelectedCategoryId(match.id);
                }}
                options={categoriesList.map((c) => ({ value: c.name, label: c.name }))}
              />
              <SearchableCombobox
                label="Primary Location (Search 160+ Hubs & Regional Cities)"
                value={location}
                onChange={(val) => setLocation(val)}
                placeholder="Search city (e.g. Hyderabad, Bengaluru, Pune)..."
                searchPlaceholder="Search city name or type custom..."
                customPlaceholder="e.g. Hyderabad Hitec City / Gurugram CyberHub"
                options={citiesList.map((c) => ({
                  value: `${c.name}, India`,
                  label: `${c.name}, India`,
                  category: c.is_popular ? 'Metropolitan Hub' : 'Regional City',
                }))}
                allowCustom={true}
              />
              <Select
                label="Work Mode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                options={[
                  { value: 'hybrid', label: 'Hybrid' },
                  { value: 'on_site', label: 'On-site' },
                  { value: 'remote', label: 'Remote Only' },
                ]}
              />
              <Select
                label="Employment Type"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                options={[
                  { value: 'full_time', label: 'Full-Time' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'part_time', label: 'Part-Time' },
                  { value: 'internship', label: 'Internship' },
                ]}
              />
              <Select
                label="Experience Level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                options={[
                  { value: 'entry_level', label: 'Entry Level (0–2 yrs)' },
                  { value: 'mid_level', label: 'Mid Level (3–5 yrs)' },
                  { value: 'senior_level', label: 'Senior Level (6–9 yrs)' },
                  { value: 'director', label: 'Director / Lead (10+ yrs)' },
                  { value: 'executive', label: 'Executive / C-Suite' },
                ]}
              />
            </div>
          </Card>

          {/* Compensation in INR */}
          <Card className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-kth-slate-900 border-b border-kth-slate-100 pb-2">
              2. Compensation (INR ₹ Annual Gross)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Annual Salary (₹)"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="1800000"
                required
              />
              <Input
                label="Maximum Annual Salary (₹)"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="2600000"
                required
              />
            </div>
          </Card>

          {/* Job Description & Requirements */}
          <Card className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-kth-slate-900 border-b border-kth-slate-100 pb-2">
              3. Role Description, Responsibilities & Skills
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-kth-slate-800">Role Overview Summary</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the mission of this role and the problems the candidate will solve..."
                className="w-full font-sans text-xs p-3 rounded-xl bg-white border border-kth-slate-200 text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-kth-slate-800">
                Key Responsibilities <span className="text-kth-slate-400 font-normal">(One per line)</span>
              </label>
              <textarea
                rows={3}
                value={responsibilitiesText}
                onChange={(e) => setResponsibilitiesText(e.target.value)}
                placeholder="Lead corporate ESG audits&#10;Develop decarbonization roadmaps&#10;Author BRSR compliance reports"
                className="w-full font-sans text-xs p-3 rounded-xl bg-white border border-kth-slate-200 text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-kth-slate-800">
                Requirements & Qualifications <span className="text-kth-slate-400 font-normal">(One per line)</span>
              </label>
              <textarea
                rows={3}
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                placeholder="Bachelor's in Environmental Science or related field&#10;3+ years consulting experience in ESG/Sustainability&#10;Proficiency in GHG Protocol and GRI Standards"
                className="w-full font-sans text-xs p-3 rounded-xl bg-white border border-kth-slate-200 text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-kth-slate-800">
                Required Skills & Keywords <span className="text-kth-slate-400 font-normal">(Comma Separated)</span>
              </label>
              <Input
                placeholder="ESG Reporting, BRSR, ISO 14001, Carbon Accounting, GRI"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-kth-slate-800">
                Benefits & Perks <span className="text-kth-slate-400 font-normal">(Comma Separated)</span>
              </label>
              <Input
                placeholder="Health Insurance, Performance Bonus, Learning Stipend"
                value={benefitsText}
                onChange={(e) => setBenefitsText(e.target.value)}
              />
            </div>
          </Card>

          {/* Featured Job Promotion & Duration Selection Card */}
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 border-2 border-amber-200/80 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm text-kth-slate-900">
                      Boost with Featured Placement
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full">
                      <Zap className="w-3 h-3 fill-current text-amber-600" /> 4x Faster Hiring
                    </span>
                  </div>
                  <p className="text-xs text-kth-slate-600 mt-0.5">
                    Pin your job opening at the top of candidate search results, category pages, and personalized alert digests.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="text-xs font-bold text-kth-slate-700">
                  {isFeatured ? 'Featured Enabled' : 'Standard Listing'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer ${
                    isFeatured ? 'bg-amber-500' : 'bg-kth-slate-200'
                  }`}
                  aria-pressed={isFeatured}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isFeatured ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Duration & Pricing Tiers Selection (Only shown when Featured is enabled) */}
            {isFeatured && (
              <div className="pt-4 border-t border-amber-200/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-kth-slate-900">Select Featured Duration:</span>
                  <span className="text-[11px] text-amber-700 font-medium">Billed once via Secure Razorpay Checkout</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FEATURED_JOB_TIERS.map((tier) => {
                    const isSelected = selectedFeaturedTierId === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedFeaturedTierId(tier.id)}
                        className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-500 shadow-xs'
                            : 'bg-white border-kth-slate-200 hover:border-amber-300 hover:bg-amber-50/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-kth-slate-900">{tier.label}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-kth-slate-100 text-kth-slate-600'
                            }`}
                          >
                            {tier.badge}
                          </span>
                        </div>
                        <div className="font-mono font-extrabold text-lg text-kth-slate-900 mb-1">
                          {formatINR(tier.priceINR)}
                        </div>
                        <p className="text-[11px] text-kth-slate-500 leading-tight">
                          {tier.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-100/50 border border-amber-200 text-[11px] text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Your featured status activates <strong>instantly</strong> upon publishing and payment verification. Full receipt & invoice available in Billing.
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
            <Button
              variant="secondary"
              type="button"
              disabled={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              onClick={() => handleSave('draft')}
            >
              Save as Draft
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                type="button"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => {
                  const previewPayload = {
                    title,
                    department,
                    location,
                    min_salary_inr: Number(minSalary) || 0,
                    max_salary_inr: Number(maxSalary) || 0,
                    description,
                    responsibilities: responsibilitiesText.split('\n').map((s: string) => s.trim()).filter(Boolean),
                    requirements: requirementsText.split('\n').map((s: string) => s.trim()).filter(Boolean),
                    skills: skillsText.split(',').map((s: string) => s.trim()).filter(Boolean),
                  };
                  sessionStorage.setItem('kth_job_preview_data', JSON.stringify(previewPayload));
                  handleNavigate('/employer/jobs/preview');
                }}
              >
                Preview Listing
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                leftIcon={
                  !isSubmitting ? (
                    isFeatured ? (
                      <Zap className="w-4 h-4 fill-current text-amber-300" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )
                  ) : undefined
                }
                className={isFeatured ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-sm' : ''}
              >
                {isSubmitting
                  ? 'Processing...'
                  : isFeatured
                  ? `Pay & Publish Featured Job (${formatINR(
                      (FEATURED_JOB_TIERS.find((t) => t.id === selectedFeaturedTierId) || FEATURED_JOB_TIERS[0]).priceINR
                    )})`
                  : 'Publish Job Listing'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </EmployerShell>
  );
};
