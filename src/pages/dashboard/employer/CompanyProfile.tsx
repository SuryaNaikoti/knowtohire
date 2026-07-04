import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/services/employerService';
import type { Company } from '../../../lib/services/employerService';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Alert } from '../../../components/ui/Alert';
import { Loading } from '../../../components/ui/Loading';
import { LogoUploader } from '../../../components/dashboard/LogoUploader';
import { Settings, Image, Globe, Mail } from 'lucide-react';

export const CompanyProfile: React.FC = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchCompany = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const comp = await employerService.getCompanyByEmployer(user.id);
      if (comp) {
        setCompany(comp);
        setName(comp.name);
        setEmail(comp.company_email || '');
        setWebsite(comp.website_url || '');
        setLinkedin(comp.linkedin_url || '');
        setIndustry(comp.industry || '');
        setSize(comp.company_size || '');
        setDescription(comp.description || '');
      }
    } catch (err) {
      console.error(err);
      setError('Could not load company profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const payload: Partial<Company> = {
        name,
        company_email: email,
        website_url: website,
        linkedin_url: linkedin,
        industry,
        company_size: size,
        description,
      };

      const success = await employerService.updateCompany(company.id, payload);
      if (success) {
        setSuccess(true);
        // Refresh details
        const updated = await employerService.getCompany(company.id);
        if (updated) setCompany(updated);
      } else {
        setError('Failed to update company details.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during save operations.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadSuccess = (type: 'logo' | 'banner', newUrl: string) => {
    if (company) {
      setCompany({
        ...company,
        [type === 'logo' ? 'logo_url' : 'banner_url']: newUrl
      });
    }
  };

  if (loading) {
    return <Loading label="Loading company settings..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight">
            Company Profile Settings
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Configure your corporate branding details, contact channels, size metrics, and descriptions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main profile editor form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-primary" /> Corporate Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                {error && <Alert type="error" className="text-xs" title="Profile Alert">{error}</Alert>}
                {success && <Alert type="success" className="text-xs" title="Profile Stored">Company changes saved successfully.</Alert>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. InnoTech Solutions"
                  />
                  <Input
                    label="Corporate Contact Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recruiting@company.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Website URL"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://company.com"
                    leftIcon={<Globe className="w-4 h-4" />}
                  />
                  <Input
                    label="LinkedIn Company Page"
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/company/handle"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Industry Sector"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Software, Cloud Engineering"
                  />
                  <Select
                    label="Company Size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  >
                    <option value="">Select company size...</option>
                    <option value="1-9 Employees">1-9 Employees</option>
                    <option value="10-49 Employees">10-49 Employees</option>
                    <option value="50-249 Employees">50-249 Employees</option>
                    <option value="250-999 Employees">250-999 Employees</option>
                    <option value="1000+ Employees">1000+ Employees</option>
                  </Select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">
                    Company Description / Biography
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[140px] outline-none"
                    placeholder="Provide a bio introducing your company's core products, engineering stacks, and mission statement..."
                    value={description}
                    required
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={saving} className="font-bold text-xs">
                    Save General Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Media branding upload boxes */}
        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Image className="w-4 h-4 text-secondary" /> Logo Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              {company && (
                <LogoUploader
                  companyId={company.id}
                  type="logo"
                  currentUrl={company.logo_url}
                  onUploadSuccess={(url) => handleUploadSuccess('logo', url)}
                />
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Image className="w-4 h-4 text-accent" /> Profile Header Banner
              </CardTitle>
            </CardHeader>
            <CardContent>
              {company && (
                <LogoUploader
                  companyId={company.id}
                  type="banner"
                  currentUrl={company.banner_url}
                  onUploadSuccess={(url) => handleUploadSuccess('banner', url)}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
