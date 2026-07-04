import React, { useState, useEffect } from 'react';
import { jobsService } from '../../lib/services/jobsService';
import type { Job, JobCategory, JobPayload, JobSkill, JobSkillPayload } from '../../lib/services/jobsService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Alert } from '../ui/Alert';
import { Plus, Trash2 } from 'lucide-react';

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
      setSkills([]);
    }
    setError('');
  }, [jobToEdit, skillsToEdit]);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
      {error && <Alert type="error" className="text-xs" title="Form Submission Error">{error}</Alert>}

      {/* Basic Vacancy details */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 border-solid space-y-4">
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
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 border-solid space-y-4">
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
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 border-solid space-y-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Compensation & Timelines</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input
            label="Min Salary (Annual/Hr)"
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="e.g. 120000"
          />
          <Input
            label="Max Salary (Annual/Hr)"
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="e.g. 160000"
          />
          <Select
            label="Currency"
            value={salaryCurrency}
            onChange={(e) => setSalaryCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </Select>
          <Input
            label="Application Deadline"
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <label className="flex items-center space-x-2 text-xs font-semibold text-gray-650 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={salaryVisible}
            onChange={(e) => setSalaryVisible(e.target.checked)}
            className="rounded border-gray-350 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
          />
          <span>Show salary range publicly on candidate listings</span>
        </label>
      </div>

      {/* Copy Rich Text Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-gray-700 tracking-wide">
            Job Description / Roles & Responsibilities *
          </label>
          <textarea
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[140px] outline-none"
            placeholder="Provide a bio introducing the vacancy scope, day-to-day duties, and project timelines..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-gray-700 tracking-wide">
            Candidate Requirements / Skills *
          </label>
          <textarea
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[140px] outline-none"
            placeholder="Specify educational degrees, specific coding experience, cert codes, and stack tools..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="text-xs font-bold text-gray-700 tracking-wide">Benefits & Perks</label>
        <textarea
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[80px] outline-none"
          placeholder="e.g. Remote stipend, equity opportunities, premium health plans, gym membership..."
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
        />
      </div>

      {/* Relational Required Skills Matrix */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 border-solid space-y-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Relational Required Skills</h4>
        
        {/* Active Skills Badges */}
        {skills.length === 0 ? (
          <p className="text-xs text-gray-400 font-semibold italic">No skill requirements specified. Candidates matching will rely strictly on resume text scanning.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 border-solid rounded-lg select-none">
                <span>{s.skill_name} ({s.years_experience_required}y+, {s.required_level})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="text-blue-400 hover:text-blue-900 cursor-pointer border-none bg-transparent"
                  aria-label={`Remove skill constraint ${s.skill_name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Skill addition widget */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-2 border-t border-gray-100 border-solid">
          <Input
            label="Skill Name"
            placeholder="e.g. React, USPTO, ESG"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
          />
          <Select
            label="Competency Required"
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as any)}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </Select>
          <Input
            label="Min Yrs Experience"
            type="number"
            min="0"
            value={skillYears}
            onChange={(e) => setSkillYears(e.target.value)}
          />
          <Button type="button" onClick={handleAddSkill} variant="outline" size="sm" className="h-10 text-xs font-bold bg-white w-full">
            <Plus className="w-4 h-4 mr-1" /> Add Constraint
          </Button>
        </div>
      </div>

      {/* Submission State Toggles */}
      <div className="border-t border-gray-150 border-solid pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col space-y-1.5 self-start">
          <label className="text-xs font-bold text-gray-700 tracking-wide">Vacancy Status Status</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="draft">Save as Draft (Recruiter workspace only)</option>
            <option value="published">Publish (Submit to Admin approval queue)</option>
          </Select>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="font-bold text-xs bg-white">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} className="font-bold text-xs">
            {jobToEdit ? 'Save Changes' : 'Create Vacancy'}
          </Button>
        </div>
      </div>
    </form>
  );
};
