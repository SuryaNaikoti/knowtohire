import React, { useState, useEffect } from 'react';
import { jobsService } from '../../lib/services/jobsService';
import type { Job, JobCategory, JobPayload, JobSkill, JobSkillPayload } from '../../lib/services/jobsService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Alert } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Eye, Edit2, MapPin, DollarSign, Clock } from 'lucide-react';

interface JobFormProps {
  jobToEdit?: Job | null;
  skillsToEdit?: JobSkill[] | null;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export const JobForm: React.FC<JobFormProps> = ({
  jobToEdit = null,
  skillsToEdit = null,
  onSubmitSuccess,
  onCancel,
}) => {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autosaveStatus, setAutosaveStatus] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Primary Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [careerDomain, setCareerDomain] = useState<'General' | 'Environmental' | 'ESG' | 'Patent' | 'IPR' | 'Research' | 'Consulting'>('General');
  const [locationType, setLocationType] = useState<'Onsite' | 'Remote' | 'Hybrid'>('Onsite');
  const [country, setCountry] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [city, setCity] = useState('');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Internship'>('Full-time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [salaryVisible, setSalaryVisible] = useState(true);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [scheduledPublishDate, setScheduledPublishDate] = useState('');

  // Skills List State
  const [skills, setSkills] = useState<JobSkillPayload[]>([]);
  
  // Skill builder inputs
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [skillYears, setSkillYears] = useState('1');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await jobsService.getJobCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (jobToEdit) {
      setTitle(jobToEdit.title);
      setCategory(jobToEdit.category_id || '');
      setCareerDomain(jobToEdit.career_domain);
      setLocationType(jobToEdit.location_type);
      setCountry(jobToEdit.country);
      setStateVal(jobToEdit.state || '');
      setCity(jobToEdit.city);
      setEmploymentType(jobToEdit.employment_type);
      setSalaryMin(jobToEdit.salary_min ? jobToEdit.salary_min.toString() : '');
      setSalaryMax(jobToEdit.salary_max ? jobToEdit.salary_max.toString() : '');
      setSalaryCurrency(jobToEdit.salary_currency);
      setSalaryVisible(jobToEdit.salary_visible);
      setDescription(jobToEdit.description);
      setRequirements(jobToEdit.requirements);
      setBenefits(jobToEdit.benefits || '');
      setDeadline(jobToEdit.application_deadline ? jobToEdit.application_deadline.split('T')[0] : '');
      setStatus(jobToEdit.status === 'published' ? 'published' : 'draft');

      if (skillsToEdit) {
        setSkills(skillsToEdit.map(s => ({
          skill_name: s.skill_name,
          required_level: s.required_level,
          years_experience_required: s.years_experience_required
        })));
      }
    } else {
      setTitle('');
      setCategory('');
      setCareerDomain('General');
      setLocationType('Onsite');
      setCountry('United States');
      setStateVal('');
      setCity('');
      setEmploymentType('Full-time');
      setSalaryMin('');
      setSalaryMax('');
      setSalaryCurrency('USD');
      setSalaryVisible(true);
      setDescription('');
      setRequirements('');
      setBenefits('');
      setDeadline(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setStatus('draft');
      setScheduledPublishDate('');
      setSkills([]);
    }
    setError('');
  }, [jobToEdit, skillsToEdit]);

  // AUTOSAVE TRIGGER: every 15 seconds if fields are dirty and status is draft
  useEffect(() => {
    if (status !== 'draft' || !title) return;

    const interval = setInterval(async () => {
      try {
        const payload: JobPayload = {
          title,
          slug: jobToEdit ? jobToEdit.slug : `autosave-${title.toLowerCase().replace(/ /g, '-')}-${Math.random().toString(36).substring(2, 6)}`,
          category_id: category || null,
          description,
          requirements,
          benefits: benefits || undefined,
          career_domain: careerDomain,
          location_type: locationType,
          country,
          state: stateVal || undefined,
          city,
          employment_type: employmentType,
          salary_min: salaryMin ? parseFloat(salaryMin) : undefined,
          salary_max: salaryMax ? parseFloat(salaryMax) : undefined,
          salary_currency: salaryCurrency,
          salary_visible: salaryVisible,
          status: 'draft',
          application_deadline: deadline || undefined,
        };

        if (jobToEdit) {
          await jobsService.updateJob(jobToEdit.id, payload, skills);
        }
        setAutosaveStatus(`Draft autosaved at ${new Date().toLocaleTimeString()}`);
        setTimeout(() => setAutosaveStatus(''), 3000);
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [title, category, description, requirements, benefits, careerDomain, locationType, country, stateVal, city, employmentType, salaryMin, salaryMax, salaryCurrency, salaryVisible, deadline, status, skills, jobToEdit]);

  const generateSlug = (text: string) => {
    const base = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const rand = Math.random().toString(36).substring(2, 7);
    return `${base}-${rand}`;
  };

  const handleAddSkill = () => {
    if (!skillName.trim()) return;
    if (skills.some(s => s.skill_name.toLowerCase() === skillName.trim().toLowerCase())) {
      alert('This skill constraint has already been added.');
      return;
    }
    setSkills([...skills, {
      skill_name: skillName.trim(),
      required_level: skillLevel,
      years_experience_required: parseInt(skillYears) || 1
    }]);
    setSkillName('');
    setSkillLevel('Intermediate');
    setSkillYears('1');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !description || !requirements || !country || !city) {
      setError('Please fill in all required fields.');
      return;
    }

    if (salaryMin && salaryMax && parseFloat(salaryMin) > parseFloat(salaryMax)) {
      setError('Minimum salary cannot exceed maximum salary.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload: JobPayload = {
        title,
        slug: jobToEdit ? jobToEdit.slug : generateSlug(title),
        category_id: category,
        description,
        requirements,
        benefits: benefits || undefined,
        career_domain: careerDomain,
        location_type: locationType,
        country,
        state: stateVal || undefined,
        city,
        employment_type: employmentType,
        salary_min: salaryMin ? parseFloat(salaryMin) : undefined,
        salary_max: salaryMax ? parseFloat(salaryMax) : undefined,
        salary_currency: salaryCurrency,
        salary_visible: salaryVisible,
        status,
        application_deadline: deadline || undefined,
        expires_at: deadline ? new Date(deadline).toISOString() : undefined,
      };

      if (jobToEdit) {
        await jobsService.updateJob(jobToEdit.id, payload, skills);
      } else {
        await jobsService.createJob(payload, skills);
      }

      onSubmitSuccess();
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving the job posting.');
    } finally {
      setLoading(false);
    }
  };

  const parentCategories = categories.filter(c => !c.parent_category_id);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_category_id === parentId);

  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-solid border-gray-150 pb-3">
          <h3 className="font-heading font-black text-gray-900 text-sm flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-primary" /> Candidate Preview Mode
          </h3>
          <Button size="sm" variant="outline" className="bg-white text-xs font-bold" onClick={() => setIsPreviewMode(false)}>
            <Edit2 className="w-3.5 h-3.5 mr-1" /> Back to Editor
          </Button>
        </div>

        <div className="border border-solid border-gray-200 rounded-2xl p-6 bg-white space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-950">{title || 'Vacancy Title'}</h2>
            <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-gray-500">
              <Badge variant="primary">{careerDomain}</Badge>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {city || 'City'}, {country || 'Country'} ({locationType})</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {employmentType}</span>
              {salaryVisible && salaryMin && (
                <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
                  <DollarSign className="w-3.5 h-3.5" /> {salaryMin} - {salaryMax} {salaryCurrency}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">About the Role</h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{description || 'No description provided.'}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Required Qualifications</h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{requirements || 'No requirements provided.'}</p>
          </div>

          {benefits && (
            <div className="space-y-2">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Benefits & Perks</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{benefits}</p>
            </div>
          )}

          {skills.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Skill Matching Criteria</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-800 border-blue-200">
                    {s.skill_name} ({s.required_level}, {s.years_experience_required} yrs)
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        {error && <Alert type="error" className="text-xs flex-1 mr-4" title="Form Submission Error">{error}</Alert>}
        {autosaveStatus && (
          <div className="text-[10px] text-gray-400 font-bold bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-lg">
            {autosaveStatus}
          </div>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="bg-white text-xs font-bold self-start ml-auto"
          onClick={() => setIsPreviewMode(true)}
        >
          <Eye className="w-3.5 h-3.5 mr-1" /> Live Preview
        </Button>
      </div>

      {/* Basic Vacancy details */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-155 border-solid space-y-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Vacancy Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Position Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Patent Engineer"
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 tracking-wide">Category Category</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Select category...</option>
              {parentCategories.map(parent => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name} (General)</option>
                  {getSubcategories(parent.id).map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Career Domain"
            value={careerDomain}
            onChange={(e) => setCareerDomain(e.target.value as any)}
          >
            <option value="General">General</option>
            <option value="Environmental">Environmental</option>
            <option value="ESG">ESG</option>
            <option value="Patent">Patent</option>
            <option value="IPR">IPR</option>
            <option value="Research">Research</option>
            <option value="Consulting">Consulting</option>
          </Select>

          <Select
            label="Employment Type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as any)}
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </Select>

          <Select
            label="Workplace Location Type"
            value={locationType}
            onChange={(e) => setLocationType(e.target.value as any)}
          >
            <option value="Onsite">Onsite</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </Select>
        </div>
      </div>

      {/* Localization details */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-155 border-solid space-y-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Job Location Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Country"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. United States"
          />
          <Input
            label="State / Province"
            value={stateVal}
            onChange={(e) => setStateVal(e.target.value)}
            placeholder="e.g. California"
          />
          <Input
            label="City / Town"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. San Francisco"
          />
        </div>
      </div>

      {/* Compensation & Expirations */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-155 border-solid space-y-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Compensation & Timelines</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input
            label="Min Salary (Annual)"
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="e.g. 80000"
          />
          <Input
            label="Max Salary (Annual)"
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="e.g. 120000"
          />
          <Input
            label="Currency"
            value={salaryCurrency}
            onChange={(e) => setSalaryCurrency(e.target.value)}
          />
          <div className="flex flex-col justify-end pb-2.5">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={salaryVisible}
                onChange={(e) => setSalaryVisible(e.target.checked)}
                className="rounded border-gray-300 text-primary w-4 h-4"
              />
              <span className="text-xs font-bold text-gray-700">Display salary range to candidates</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Application Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Input
            label="Scheduled Publish Date (Optional)"
            type="date"
            value={scheduledPublishDate}
            onChange={(e) => setScheduledPublishDate(e.target.value)}
          />
        </div>
      </div>

      {/* Job Description & Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-gray-700">Vacancy Description</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg border border-gray-350 focus:border-primary text-sm font-medium text-gray-900 min-h-[160px] outline-none"
            placeholder="Provide a description of role goals, technologies, and team context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-gray-700">Role Requirements</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg border border-gray-350 focus:border-primary text-sm font-medium text-gray-900 min-h-[160px] outline-none"
            placeholder="Outline credentials, tech skills, and domain certifications required..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="text-xs font-bold text-gray-700">Corporate Benefits & Perks</label>
        <textarea
          className="w-full px-4 py-2.5 rounded-lg border border-gray-350 focus:border-primary text-sm font-medium text-gray-900 min-h-[80px] outline-none"
          placeholder="Mention matching pension schemes, medical coverage, flexible remote working setups..."
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
        />
      </div>

      {/* Skill builder matching constraints */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-155 border-solid space-y-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Automated Skill Matching Triggers</h4>
        
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {skills.map((s, idx) => (
              <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1.5">
                {s.skill_name} ({s.required_level}, {s.years_experience_required} yrs)
                <button type="button" onClick={() => handleRemoveSkill(idx)} className="hover:text-red-655 font-bold cursor-pointer">&times;</button>
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <Input
            label="Skill Name"
            placeholder="e.g. React"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Competency Required</label>
            <Select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value as any)}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </Select>
          </div>
          <Input
            label="Min Experience (Years)"
            type="number"
            min="1"
            value={skillYears}
            onChange={(e) => setSkillYears(e.target.value)}
          />
          <Button type="button" variant="outline" className="bg-white font-bold h-10" onClick={handleAddSkill}>
            Add Skill Filter
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-solid border-gray-200">
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-gray-700">Publication Status</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="draft">Save as Draft (Private)</option>
            <option value="published">Publish to Directory (Vetted Queue)</option>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} className="bg-white text-xs font-bold" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} className="text-xs font-bold">
            {jobToEdit ? 'Save Changes' : 'Post Vacancy'}
          </Button>
        </div>
      </div>
    </form>
  );
};
