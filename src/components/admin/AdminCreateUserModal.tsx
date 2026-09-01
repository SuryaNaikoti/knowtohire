import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { adminService, AdminUserCreateInput, AdminUserRecord } from '@/services/adminService';
import {
  UserPlus,
  User,
  Building2,
  Mail,
  Briefcase,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export interface AdminCreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: (user: AdminUserRecord) => void;
}

export const AdminCreateUserModal: React.FC<AdminCreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [status, setStatus] = useState<'active' | 'pending_onboarding'>('active');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Candidate Fields
  const [headline, setHeadline] = useState('');
  const [domain, setDomain] = useState('Full Stack & Enterprise Software');
  const [location, setLocation] = useState('Hyderabad, Telangana');
  const [skills, setSkills] = useState('React, TypeScript, Node.js, Cloud');
  const [expectedSalary, setExpectedSalary] = useState('1800000');

  // Employer Fields
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [industry, setIndustry] = useState('Technology & Software Advisory');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [companySize, setCompanySize] = useState('51-200 employees');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setHeadline('');
    setSkills('React, TypeScript, Node.js, Cloud');
    setExpectedSalary('1800000');
    setCompanyName('');
    setLegalName('');
    setRegistrationNumber('');
    setWebsiteUrl('');
    setCompanyDescription('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (role === 'employer' && !companyName.trim()) {
      setErrorMessage('Company / Enterprise name is required for employer accounts.');
      return;
    }

    setIsSubmitting(true);

    const inputData: AdminUserCreateInput = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      role,
      status,
      // Candidate Specific
      headline: headline.trim() || undefined,
      domain_specialization: domain,
      location: location.trim() || undefined,
      skills: skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      expected_salary_inr: expectedSalary ? parseInt(expectedSalary, 10) : undefined,
      // Employer Specific
      company_name: companyName.trim() || undefined,
      legal_name: legalName.trim() || companyName.trim() || undefined,
      industry: industry.trim() || undefined,
      registration_number: registrationNumber.trim() || undefined,
      company_size: companySize,
      website_url: websiteUrl.trim() || undefined,
      company_description: companyDescription.trim() || undefined,
    };

    const res = await adminService.createUser(inputData);
    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error.message);
    } else if (res.data) {
      setSuccessMessage(`Account for "${res.data.full_name}" has been successfully created.`);
      if (onUserCreated) {
        onUserCreated(res.data);
      }
      setTimeout(() => {
        handleClose();
      }, 1000);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Platform User"
      description="Provision verified candidate profiles or corporate employer enterprises directly from the Superuser administration console."
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2 text-kth-slate-800">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Role & Status Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200">
          <div>
            <label className="block text-xs font-bold text-kth-slate-700 uppercase tracking-wider mb-1.5">
              Account Role *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  role === 'candidate'
                    ? 'bg-kth-primary-600 border-kth-primary-600 text-white shadow-xs'
                    : 'bg-white border-kth-slate-200 text-kth-slate-700 hover:border-kth-slate-300'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  role === 'employer'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-white border-kth-slate-200 text-kth-slate-700 hover:border-kth-slate-300'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Employer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-kth-slate-700 uppercase tracking-wider mb-1.5">
              Initial Status
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'active', label: 'Active (Direct Verified Access)' },
                { value: 'pending_onboarding', label: 'Pending Onboarding' },
              ]}
            />
          </div>
        </div>

        {/* Core Credentials */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider font-bold text-kth-slate-500 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-kth-primary-600" />
            Core Credentials & Contact Info
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Input
                label="Full Name *"
                placeholder={role === 'candidate' ? 'e.g. Rahul Verma' : 'e.g. Priya Sharma (Talent Lead)'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                label="Email Address *"
                type="email"
                placeholder={role === 'candidate' ? 'rahul.verma@example.com' : 'priya.hr@enterprise.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Fields: Candidate Specific */}
        {role === 'candidate' && (
          <div className="space-y-3 pt-2 border-t border-kth-slate-200">
            <h4 className="text-xs uppercase tracking-wider font-bold text-kth-slate-500 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-kth-primary-600" />
              Candidate Profile & Professional Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Professional Headline"
                placeholder="e.g. Senior Full Stack Engineer / ESG Analyst"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
              <Input
                label="Primary Location"
                placeholder="e.g. Hyderabad, Telangana / Bengaluru"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-kth-slate-700 mb-1">Domain Specialization</label>
                <Select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  options={[
                    { value: 'Full Stack & Enterprise Software', label: 'Full Stack & Enterprise Software' },
                    { value: 'Cloud Infrastructure & DevOps', label: 'Cloud Infrastructure & DevOps' },
                    { value: 'ESG & Sustainability Careers', label: 'ESG & Sustainability Careers' },
                    { value: 'Carbon Accounting & Net-Zero Strategy', label: 'Carbon Accounting & Net-Zero Strategy' },
                    { value: 'Data Science & Machine Learning', label: 'Data Science & Machine Learning' },
                    { value: 'Product Management', label: 'Product Management' },
                  ]}
                />
              </div>
              <Input
                label="Expected CTC (INR / Year)"
                placeholder="e.g. 1800000"
                type="number"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Verified Skills (Comma Separated)"
                placeholder="React, TypeScript, AWS, SQL, Kubernetes"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Dynamic Fields: Employer Specific */}
        {role === 'employer' && (
          <div className="space-y-3 pt-2 border-t border-kth-slate-200">
            <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Corporate Enterprise & Legal Entity Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Enterprise / Company Name *"
                placeholder="e.g. TechEdge Solutions India Pvt Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <Input
                label="Legal Entity Name"
                placeholder="e.g. TechEdge Solutions India Private Limited"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Industry / Domain"
                placeholder="e.g. Environmental Advisory / SaaS"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
              <Input
                label="Corporate ID / CIN"
                placeholder="e.g. U74999KA2026PTC148911"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
              <div>
                <label className="block text-xs font-medium text-kth-slate-700 mb-1">Company Size</label>
                <Select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  options={[
                    { value: '1-10 employees', label: '1-10 employees' },
                    { value: '11-50 employees', label: '11-50 employees' },
                    { value: '51-200 employees', label: '51-200 employees' },
                    { value: '201-500 employees', label: '201-500 employees' },
                    { value: '500+ employees', label: '500+ employees' },
                  ]}
                />
              </div>
            </div>

            <Input
              label="Official Website URL"
              placeholder="https://techedge.in"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-kth-slate-700 mb-1">
                Company Overview & Profile
              </label>
              <Textarea
                placeholder="Brief description of the corporate enterprise, services, and recruitment focus..."
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-kth-slate-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="text-xs font-bold bg-kth-primary-600 hover:bg-kth-primary-700 text-white shadow-xs"
            leftIcon={isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? 'Creating User...' : `Create ${role === 'candidate' ? 'Candidate' : 'Employer'} User`}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
