import React, { useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { adminService, AdminUserCreateInput } from '@/services/adminService';
import {
  UserPlus,
  User,
  Building2,
  Mail,
  Briefcase,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export interface AdminCreateUserPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminCreateUserPage: React.FC<AdminCreateUserPageProps> = ({ onNavigate }) => {
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

  const handleBack = () => {
    const target = '/admin/users';
    if (onNavigate) {
      onNavigate(target);
    } else {
      window.history.pushState({}, '', target);
      window.dispatchEvent(new Event('popstate'));
    }
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
      setSuccessMessage(`Account for "${res.data.full_name}" has been successfully provisioned.`);
      setTimeout(() => {
        handleBack();
      }, 1200);
    }
  };

  return (
    <AdminShell title="Create Platform User" currentPath="/admin/users">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to User Directory
          </button>
        </div>

        <Card className="p-6 sm:p-8 bg-white border-kth-slate-200 shadow-sm">
          <div className="border-b border-kth-slate-100 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-kth-slate-900 font-display">
                  Provision New Platform User
                </h2>
                <p className="text-xs text-kth-slate-500 mt-0.5">
                  Create verified candidate profiles or corporate employer enterprises directly from the Superuser administration console.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-kth-slate-800">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Role & Status Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-kth-slate-50 p-5 rounded-2xl border border-kth-slate-200">
              <div>
                <label className="block text-xs font-bold text-kth-slate-700 uppercase tracking-wider mb-2">
                  Select Account Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('candidate')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      role === 'candidate'
                        ? 'bg-kth-primary-600 border-kth-primary-600 text-white shadow-xs'
                        : 'bg-white border-kth-slate-200 text-kth-slate-700 hover:border-kth-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      role === 'employer'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-white border-kth-slate-200 text-kth-slate-700 hover:border-kth-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Employer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-kth-slate-700 uppercase tracking-wider mb-2">
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
            <div className="space-y-4 pt-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-kth-slate-500 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-kth-primary-600" />
                Core Credentials & Contact Info
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className="space-y-4 pt-4 border-t border-kth-slate-200">
                <h4 className="text-xs uppercase tracking-wider font-bold text-kth-slate-500 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-kth-primary-600" />
                  Candidate Profile & Professional Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="space-y-4 pt-4 border-t border-kth-slate-200">
                <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-600 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Corporate Enterprise & Legal Entity Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-kth-slate-200">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleBack}
                disabled={isSubmitting}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                className="text-xs font-bold bg-kth-primary-600 hover:bg-kth-primary-700 text-white shadow-xs"
                leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              >
                {isSubmitting ? 'Creating User...' : `Create ${role === 'candidate' ? 'Candidate' : 'Employer'} User`}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminShell>
  );
};
