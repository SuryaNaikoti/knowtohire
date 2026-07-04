import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

export const EmployerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLogo] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('10-50');
  const [description, setDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setErrorMsg(null);

    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    try {
      // 1. Create company row
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          slug,
          website: companyWebsite || null,
          logo_url: companyLogo || null,
          industry,
          size: companySize,
          description
        })
        .select('id')
        .single();

      if (companyError) throw companyError;

      // 2. Link employer profile to company and add job title details
      const { error: profileError } = await supabase
        .from('employer_profiles')
        .update({
          company_id: newCompany.id,
          job_title: jobTitle
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      navigate('/employer/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Employer onboarding registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Employer Portal Onboarding" subtitle={`Step ${step} of 3: Configure corporate profile.`}>
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xs font-semibold leading-relaxed">
          {errorMsg}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Company Legal Name</label>
            <Input
              type="text"
              required
              placeholder="e.g. Acme Tech Solutions"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Your Job Title</label>
            <Input
              type="text"
              required
              placeholder="e.g. HR Director / Recruiting Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>
          <Button onClick={handleNext} className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5">
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Company Description</label>
            <textarea
              required
              rows={4}
              placeholder="Write a brief summary of what your firm builds or accomplishes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handlePrev} variant="outline" className="h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button onClick={handleNext} className="h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5">
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Corporate Website</label>
            <Input
              type="url"
              required
              placeholder="https://acmetech.com"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Industry Vertical</label>
              <Input
                type="text"
                required
                placeholder="e.g. Technology / AI"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full text-xs font-semibold h-11"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer h-11 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="1-10">1 - 10 employees</option>
                <option value="10-50">10 - 50 employees</option>
                <option value="50-250">50 - 250 employees</option>
                <option value="250+">250+ employees</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button type="button" onClick={handlePrev} variant="outline" className="h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button type="submit" isLoading={loading} className="h-11 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5">
              <Save className="w-4 h-4" />
              <span>Save & Onboard</span>
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default EmployerOnboarding;
