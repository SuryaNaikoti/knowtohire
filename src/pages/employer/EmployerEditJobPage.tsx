import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Alert } from '@/components/ui/Alert';
import { jobService, taxonomyService, Job, JobUpdateInput, WorkMode, EmploymentType, ExperienceLevel, CareerCategory, CityItem } from '@/services';
import { Save, CheckCircle2, AlertCircle, ArrowLeft, Briefcase } from 'lucide-react';

export interface EmployerEditJobPageProps {
  jobId?: string;
}

export const EmployerEditJobPage: React.FC<EmployerEditJobPageProps> = ({ jobId: propJobId }) => {
  const resolvedJobId = propJobId || window.location.pathname.split('/employer/jobs/')[1]?.split('/edit')[0] || '';

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Taxonomy Lists
  const [categoriesList, setCategoriesList] = useState<CareerCategory[]>([]);
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);
  const [rolesList, setRolesList] = useState<{ id: string; name: string; category?: string }[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('Sustainability & ESG');
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
  const [benefitsText, setBenefitsText] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTax() {
      const [catsRes, citiesRes, rolesRes, funcsRes] = await Promise.all([
        taxonomyService.getCareerCategories(),
        taxonomyService.searchCities('', 'country-in'),
        taxonomyService.searchJobRoles(),
        taxonomyService.getFunctionalAreas(),
      ]);
      if (catsRes.data) setCategoriesList(catsRes.data);
      if (citiesRes.data) setCitiesList(citiesRes.data);
      if (rolesRes.data) setRolesList(rolesRes.data.map((r) => ({ id: r.id, name: r.name, category: r.seniority_level ? r.seniority_level.replace('_', ' ') : 'General Role' })));
      if (funcsRes.data) setDepartmentsList(funcsRes.data.map((f) => f.name));
    }
    fetchTax();
  }, []);

  const loadJob = useCallback(async () => {
    if (!resolvedJobId) {
      setIsLoading(false);
      setErrorMessage('Invalid Job ID.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await jobService.getEmployerJobById(resolvedJobId);

    if (error || !data) {
      setErrorMessage(error?.message || 'Job opening not found or inaccessible.');
      setJob(null);
    } else {
      setJob(data);
      setTitle(data.title);
      setDepartment(data.department);
      setCategory(data.category);
      setSelectedCategoryId(data.career_category_id || '');
      setWorkMode(data.work_mode);
      setEmploymentType(data.employment_type);
      setExperienceLevel(data.experience_level);
      setLocation(data.location);
      setMinSalary(String(data.min_salary_inr));
      setMaxSalary(String(data.max_salary_inr));
      setDescription(data.description);
      setResponsibilitiesText((data.responsibilities || []).join('\n'));
      setRequirementsText((data.requirements || []).join('\n'));
      setSkillsText((data.skills || []).join(', '));
      setBenefitsText((data.benefits || []).join(', '));
    }

    setIsLoading(false);
  }, [resolvedJobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || isSubmitting) return;

    if (!title.trim()) {
      setFormError('Job title is required.');
      return;
    }

    const minSal = parseInt(minSalary, 10);
    const maxSal = parseInt(maxSalary, 10);

    if (isNaN(minSal) || minSal <= 0 || isNaN(maxSal) || maxSal <= 0) {
      setFormError('Please enter valid salary figures.');
      return;
    }
    if (maxSal < minSal) {
      setFormError('Max salary cannot be less than min salary.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

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

    const updates: JobUpdateInput = {
      title: title.trim(),
      department: department.trim(),
      category: category.trim(),
      location: location.trim(),
      work_mode: workMode,
      employment_type: employmentType,
      experience_level: experienceLevel,
      min_salary_inr: minSal,
      max_salary_inr: maxSal,
      description: description.trim(),
      responsibilities: responsibilities.length > 0 ? responsibilities : undefined,
      requirements: requirements.length > 0 ? requirements : undefined,
      skills: skills.length > 0 ? skills : undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      career_category_id: selectedCategoryId || undefined,
    };

    const { data, error } = await jobService.updateJob(job.id, updates);
    setIsSubmitting(false);

    if (error) {
      setFormError(error.message);
    } else if (data) {
      setJob(data);
      setSaveSuccess(true);
    }
  };

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  if (isLoading) {
    return (
      <EmployerShell title="Edit Job Opening" currentPath="/employer/jobs">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-kth-slate-200 rounded" />
          <div className="bg-white p-8 rounded-2xl border border-kth-slate-200 h-96" />
        </div>
      </EmployerShell>
    );
  }

  if (errorMessage || !job) {
    return (
      <EmployerShell title="Job Not Found" currentPath="/employer/jobs">
        <div className="bg-white p-12 rounded-2xl border border-kth-slate-200 text-center max-w-lg mx-auto my-8 space-y-4 font-sans">
          <div className="w-14 h-14 rounded-full bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-lg text-kth-slate-900">Job Not Found</h3>
          <p className="text-xs text-kth-slate-500 leading-relaxed">
            {errorMessage || 'This requisition does not exist or you do not have permission to edit it.'}
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={() => handleNavigate('/employer/jobs')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Job Openings
            </Button>
          </div>
        </div>
      </EmployerShell>
    );
  }

  return (
    <EmployerShell title={`Edit Job — ${job.title}`} currentPath="/employer/jobs">
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

        {formError && (
          <Alert variant="error" title="Validation Error">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-kth-slate-900 border-b border-kth-slate-100 pb-2">
              1. Basic Role Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                required
              />
              <Input
                label="Maximum Annual Salary (₹)"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
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
                className="w-full font-sans text-xs p-3 rounded-xl bg-white border border-kth-slate-200 text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-kth-slate-800">
                Required Skills & Keywords <span className="text-kth-slate-400 font-normal">(Comma Separated)</span>
              </label>
              <Input
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-kth-slate-800">
                Benefits & Perks <span className="text-kth-slate-400 font-normal">(Comma Separated)</span>
              </label>
              <Input
                value={benefitsText}
                onChange={(e) => setBenefitsText(e.target.value)}
              />
            </div>
          </Card>

          {/* Action Bar */}
          <div className="flex justify-end gap-2.5 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
            <Button
              variant="secondary"
              type="button"
              onClick={() => handleNavigate('/employer/jobs')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              leftIcon={!isSubmitting ? <Save className="w-4 h-4" /> : undefined}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Confirmation Dialog */}
      <Dialog
        isOpen={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        title="Changes Saved"
        description="Job details updated successfully."
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-base text-kth-slate-900">Job Requisition Updated</h4>
          <p className="text-xs text-kth-slate-500">
            Your modifications to <strong>{job.title}</strong> have been saved to the database.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button variant="primary" size="sm" onClick={() => handleNavigate('/employer/jobs')}>
              Back to Job Openings
            </Button>
          </div>
        </div>
      </Dialog>
    </EmployerShell>
  );
};
