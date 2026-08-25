import React, { useState } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { jobService, taxonomyService, JobCreateInput, WorkMode, EmploymentType, ExperienceLevel, Job, CareerCategory, CityItem } from '@/services';
import { formatINR } from '@/design-system/tokens';
import { CheckCircle2, Eye, Save, Send, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';

export const EmployerCreateJobPage: React.FC = () => {
  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('General Careers');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-general');
  const [workMode, setWorkMode] = useState<WorkMode>('hybrid');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('mid_level');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [minSalary, setMinSalary] = useState('1800000');
  const [maxSalary, setMaxSalary] = useState('2600000');
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('Health Insurance, Performance Bonus, Learning Stipend');

  // Master Taxonomy State
  const [categoriesList, setCategoriesList] = useState<CareerCategory[]>([]);
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);
  const [canonicalRoleName, setCanonicalRoleName] = useState<string | null>(null);
  const [canonicalRoleId, setCanonicalRoleId] = useState<string | null>(null);

  // UI state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdJob, setCreatedJob] = useState<Job | null>(null);

  React.useEffect(() => {
    async function fetchTaxonomy() {
      const [catsRes, citiesRes] = await Promise.all([
        taxonomyService.getCareerCategories(),
        taxonomyService.searchCities('', 'country-in'),
      ]);
      if (catsRes.data && catsRes.data.length > 0) {
        setCategoriesList(catsRes.data);
      }
      if (citiesRes.data && citiesRes.data.length > 0) {
        setCitiesList(citiesRes.data);
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
    const timer = setTimeout(resolveRole, 250);
    return () => clearTimeout(timer);
  }, [title]);

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Job title is required.';
    if (!department.trim()) return 'Department is required.';
    if (!description.trim()) return 'Job description is required.';

    const minSal = parseInt(minSalary, 10);
    const maxSal = parseInt(maxSalary, 10);

    if (isNaN(minSal) || minSal <= 0) return 'Please provide a valid minimum salary in INR.';
    if (isNaN(maxSal) || maxSal <= 0) return 'Please provide a valid maximum salary in INR.';
    if (maxSal < minSal) return 'Maximum salary cannot be less than minimum salary.';

    return null;
  };

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    const valError = validateForm();
    if (valError) {
      setErrorMessage(valError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const responsibilities = responsibilitiesText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const requirements = requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const benefits = benefitsText
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const payload: JobCreateInput = {
      title: title.trim(),
      department: department.trim(),
      category: category.trim(),
      location: location.trim(),
      work_mode: workMode,
      employment_type: employmentType,
      experience_level: experienceLevel,
      min_salary_inr: parseInt(minSalary, 10),
      max_salary_inr: parseInt(maxSalary, 10),
      description: description.trim(),
      responsibilities: responsibilities.length > 0 ? responsibilities : undefined,
      requirements: requirements.length > 0 ? requirements : undefined,
      skills: skills.length > 0 ? skills : undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      status: targetStatus,
      career_category_id: selectedCategoryId || undefined,
      canonical_role_id: canonicalRoleId || undefined,
    };

    const { data, error } = await jobService.createJob(payload);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
    } else if (data) {
      setCreatedJob(data);
    }
  };

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const previewSalary = `${formatINR(parseInt(minSalary, 10) || 0)} - ${formatINR(parseInt(maxSalary, 10) || 0, true)}`;

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
                <Input
                  label="Job Title"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                {canonicalRoleName && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Canonical Role: <strong>{canonicalRoleName}</strong></span>
                  </div>
                )}
              </div>
              <Input
                label="Department"
                placeholder="e.g. Software & Cloud Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
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
              <Select
                label="Primary Location (Hub & Regional Cities)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                options={citiesList.map((c) => ({ value: `${c.name}, India`, label: `${c.name}, India${c.is_popular ? ' (Popular Hub)' : ''}` }))}
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
                onClick={() => setIsPreviewOpen(true)}
              >
                Preview Listing
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                leftIcon={!isSubmitting ? <Send className="w-4 h-4" /> : undefined}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Job Listing'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Public Job Preview Modal */}
      <Dialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Public Job Listing Preview"
        description="How job seekers will view your posting on KnowToHire."
      >
        <div className="p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200 space-y-4 text-left">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex gap-1.5 mb-1">
                <Badge variant="cyan">Verified Role</Badge>
                <Badge variant="indigo" className="capitalize">{employmentType.replace('_', '-')}</Badge>
              </div>
              <h3 className="font-display font-bold text-lg text-kth-slate-900 mt-1">
                {title || 'Untitled Requisition'}
              </h3>
              <span className="text-xs text-kth-slate-500">{department || 'Department'} • {location}</span>
            </div>
            <div className="font-mono text-sm font-bold text-kth-primary-600">
              {previewSalary}
            </div>
          </div>
          <p className="text-xs text-kth-slate-700 leading-relaxed whitespace-pre-line">
            {description || 'No description provided.'}
          </p>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Created / Published Confirmation Modal */}
      <Dialog
        isOpen={Boolean(createdJob)}
        onClose={() => setCreatedJob(null)}
        title={createdJob?.status === 'published' ? "Job Published Successfully!" : "Draft Saved"}
        description={`Requisition ID: ${createdJob?.id?.slice(0, 8)}`}
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-extrabold text-lg text-kth-slate-900">
              {createdJob?.status === 'published' ? "Your Job Opening is Now Live" : "Draft Saved Successfully"}
            </h4>
            <p className="text-xs text-kth-slate-500 max-w-sm mx-auto leading-relaxed">
              {createdJob?.status === 'published'
                ? "This requisition is active and immediately discoverable by verified candidates across India."
                : "Your draft has been saved. You can edit and publish it anytime from your job openings dashboard."}
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <Button variant="primary" size="sm" onClick={() => handleNavigate('/employer/jobs')}>
              Return to Jobs Dashboard
            </Button>
          </div>
        </div>
      </Dialog>
    </EmployerShell>
  );
};
