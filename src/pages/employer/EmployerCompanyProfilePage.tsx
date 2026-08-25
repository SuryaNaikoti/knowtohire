import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { Alert } from '@/components/ui/Alert';
import {
  companyProfileService,
  ExtendedCompanyProfile,
  taxonomyService,
  Industry,
  CityItem,
} from '@/services';
import { MapPin, Users, CheckCircle2, ExternalLink, Loader2, Check, Building2, RefreshCw, X, Plus } from 'lucide-react';

export const EmployerCompanyProfilePage: React.FC = () => {
  const [industriesList, setIndustriesList] = useState<Industry[]>([]);
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);

  const [company, setCompany] = useState<ExtendedCompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [companySize, setCompanySize] = useState('51–200 Employees');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [cultureBenefits, setCultureBenefits] = useState<string[]>([]);
  const [newBenefitText, setNewBenefitText] = useState('');

  const loadTaxonomy = useCallback(async () => {
    const [indRes, citiesRes] = await Promise.all([
      taxonomyService.getIndustries(),
      taxonomyService.searchCities('', 'country-in'),
    ]);
    if (indRes.data) setIndustriesList(indRes.data);
    if (citiesRes.data) setCitiesList(citiesRes.data);
  }, []);

  const loadCompany = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await companyProfileService.getMyCompanyProfile();
    if (res.error) {
      setErrorMessage(res.error.message);
    } else if (res.data) {
      setCompany(res.data);
      setName(res.data.name || '');
      setLegalName(res.data.legal_name || '');
      setIndustry(res.data.industry || 'Environmental & ESG Advisory');
      setLocation(res.data.headquarters_location || 'Bengaluru, Karnataka, India');
      setCompanySize(res.data.company_size || '51–200 Employees');
      setWebsiteUrl(res.data.website_url || '');
      setDescription(res.data.description || '');
      setCultureBenefits(
        res.data.culture_benefits || [
          'Hybrid & Flexible Work Policy across major Indian hubs',
          'Comprehensive Health & Group Term Life Insurance',
          'Continuous Professional Development & SPCB/BRSR Certifications',
          'Decarbonization & Clean Energy R&D projects',
        ]
      );
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTaxonomy();
    loadCompany();
  }, [loadTaxonomy, loadCompany]);

  const handleStartEdit = () => {
    if (company) {
      setName(company.name || '');
      setLegalName(company.legal_name || '');
      setIndustry(company.industry || 'Environmental & ESG Advisory');
      setLocation(company.headquarters_location || 'Bengaluru, Karnataka, India');
      setCompanySize(company.company_size || '51–200 Employees');
      setWebsiteUrl(company.website_url || '');
      setDescription(company.description || '');
      setCultureBenefits(
        company.culture_benefits || [
          'Hybrid & Flexible Work Policy across major Indian hubs',
          'Comprehensive Health & Group Term Life Insurance',
          'Continuous Professional Development & SPCB/BRSR Certifications',
          'Decarbonization & Clean Energy R&D projects',
        ]
      );
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (company) {
      setName(company.name || '');
      setLegalName(company.legal_name || '');
      setIndustry(company.industry || 'Environmental & ESG Advisory');
      setLocation(company.headquarters_location || 'Bengaluru, Karnataka, India');
      setCompanySize(company.company_size || '51–200 Employees');
      setWebsiteUrl(company.website_url || '');
      setDescription(company.description || '');
      setCultureBenefits(
        company.culture_benefits || [
          'Hybrid & Flexible Work Policy across major Indian hubs',
          'Comprehensive Health & Group Term Life Insurance',
          'Continuous Professional Development & SPCB/BRSR Certifications',
          'Decarbonization & Clean Energy R&D projects',
        ]
      );
    }
    setIsEditing(false);
    setErrorMessage(null);
  };

  const handleAddBenefit = () => {
    if (!newBenefitText.trim()) return;
    setCultureBenefits((prev) => [...prev, newBenefitText.trim()]);
    setNewBenefitText('');
  };

  const handleRemoveBenefit = (idx: number) => {
    setCultureBenefits((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage('Company Legal / Display Name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const updateRes = await companyProfileService.updateMyCompanyProfile({
      name: name.trim(),
      legal_name: legalName.trim() || null,
      industry: industry.trim() || null,
      company_size: companySize || null,
      headquarters_location: location.trim() || null,
      website_url: websiteUrl.trim() || null,
      description: description.trim() || null,
      culture_benefits: cultureBenefits,
    });

    setIsSaving(false);

    if (updateRes.error) {
      setErrorMessage(updateRes.error.message);
    } else if (updateRes.data) {
      setCompany(updateRes.data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <EmployerShell title="Company Profile Management" currentPath="/employer/company-profile">
      <div className="max-w-5xl mx-auto space-y-6 font-sans">
        {errorMessage && (
          <Alert variant="error" title="Notice">
            <div className="flex justify-between items-center">
              <span>{errorMessage}</span>
              <Button variant="ghost" size="sm" onClick={() => setErrorMessage(null)}>
                Dismiss
              </Button>
            </div>
          </Alert>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500">Loading enterprise profile data...</p>
          </div>
        ) : !company ? (
          <Card className="p-12 text-center">
            <Building2 className="w-12 h-12 text-kth-slate-300 mx-auto mb-3" />
            <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1">Company Profile Unavailable</h3>
            <p className="text-xs text-kth-slate-500 max-w-sm mx-auto mb-4">
              Unable to load your company entity. Please check your credentials or retry.
            </p>
            <Button variant="outline" size="sm" onClick={loadCompany} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Retry Load
            </Button>
          </Card>
        ) : (
          <>
            {/* Company Header Card */}
            <Card className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-kth-primary-600 to-kth-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md">
                    {company.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h1 className="font-display text-2xl font-extrabold text-kth-slate-900">{company.name}</h1>
                      <Badge variant="cyan" className="capitalize">
                        {(company.verification_status || 'verified').replace('_', ' ')}
                      </Badge>
                      {saveSuccess && (
                        <Badge variant="emerald" className="flex items-center gap-1">
                          <Check className="w-3 h-3" /> Changes Saved
                        </Badge>
                      )}
                    </div>
                    {company.legal_name && company.legal_name !== company.name && (
                      <p className="text-xs text-kth-slate-500 font-medium mb-1">{company.legal_name}</p>
                    )}
                    <p className="text-xs font-semibold text-kth-slate-700 mb-1">{company.industry || 'Environmental & ESG Advisory'}</p>
                    <div className="flex items-center gap-4 text-xs text-kth-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-kth-slate-400" /> {company.headquarters_location || 'India'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-kth-slate-400" /> {company.company_size || '51–200 Employees'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" isLoading={isSaving} onClick={handleSave}>
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={handleStartEdit}>
                        Edit Company Info
                      </Button>
                      {company.website_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<ExternalLink className="w-4 h-4" />}
                          onClick={() => {
                            const url = company.website_url?.startsWith('http') ? company.website_url : `https://${company.website_url}`;
                            window.open(url, '_blank');
                          }}
                        >
                          Visit Website
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Edit Form Panel */}
            {isEditing ? (
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1">Edit Enterprise Details</h3>
                  <p className="text-xs text-kth-slate-500">Update company identity, canonical master taxonomy industry, and headquarters geography.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Display / Brand Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. EcoStrategy India"
                  />
                  <Input
                    label="Registered Legal Entity Name"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. EcoStrategy Sustainability Solutions India Pvt Ltd"
                  />

                  <SearchableCombobox
                    label="Industry Sector"
                    value={industry}
                    onChange={(val) => setIndustry(val)}
                    placeholder="Select industry sector..."
                    searchPlaceholder="Filter industries..."
                    options={industriesList.map((ind) => ({
                      value: ind.name,
                      label: ind.name,
                    }))}
                  />

                  <SearchableCombobox
                    label="Headquarters Location"
                    value={location}
                    onChange={(val) => setLocation(val)}
                    placeholder="Search canonical hub or city..."
                    searchPlaceholder="Filter city..."
                    options={citiesList.map((c) => ({
                      value: `${c.name}, India`,
                      label: `${c.name}, India`,
                      category: c.is_popular ? 'Metropolitan Hub' : 'Regional City',
                    }))}
                  />

                  <Select
                    label="Company Size"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    options={[
                      { value: '1–10 Employees', label: '1–10 Employees (Seed / Early Stage)' },
                      { value: '11–50 Employees', label: '11–50 Employees (Emerging Growth)' },
                      { value: '51–200 Employees', label: '51–200 Employees (Scale-up)' },
                      { value: '201–500 Employees', label: '201–500 Employees (Mid-Market Enterprise)' },
                      { value: '501–1000 Employees', label: '501–1000 Employees (Large Enterprise)' },
                      { value: '1000+ Employees', label: '1000+ Employees (Global Enterprise)' },
                    ]}
                  />

                  <Input
                    label="Website URL"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-kth-slate-700">About the Enterprise</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your company mission, sustainability focus, and what sets your organization apart..."
                    className="w-full bg-white border border-kth-slate-200 rounded-lg p-3 text-xs text-kth-slate-900 focus:outline-none focus:ring-1 focus:ring-kth-primary-500"
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-kth-slate-100">
                  <label className="text-xs font-semibold text-kth-slate-700">Workplace Culture & Candidate Perks</label>
                  <div className="space-y-2">
                    {cultureBenefits.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-kth-slate-50 border border-kth-slate-200 rounded-lg text-xs">
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(idx)}
                          className="text-kth-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBenefitText}
                      onChange={(e) => setNewBenefitText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBenefit();
                        }
                      }}
                      placeholder="Add a new perk or culture item (e.g. Electric Vehicle commute allowance)..."
                      className="flex-1 bg-white border border-kth-slate-200 rounded-lg px-3 py-1.5 text-xs text-kth-slate-900 focus:outline-none focus:ring-1 focus:ring-kth-primary-500"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddBenefit} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                      Add Perk
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-kth-slate-100">
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" isLoading={isSaving} onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </Card>
            ) : null}

            {/* Company Description */}
            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-3">About the Enterprise</h3>
              <p className="text-sm text-kth-slate-700 leading-relaxed whitespace-pre-line">
                {company.description || 'Specialized enterprise delivering environmental compliance, sustainability strategy, and clean innovation solutions.'}
              </p>
            </Card>

            {/* Culture & Hiring Benefits */}
            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4">
                Workplace Culture & Candidate Perks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-kth-slate-700">
                {(company.culture_benefits && company.culture_benefits.length > 0
                  ? company.culture_benefits
                  : [
                      'Hybrid & Flexible Work Policy across major Indian hubs',
                      'Comprehensive Health & Group Term Life Insurance',
                      'Continuous Professional Development & SPCB/BRSR Certifications',
                      'Decarbonization & Clean Energy R&D projects',
                    ]
                ).map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-kth-slate-50 p-3 rounded-lg border border-kth-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </EmployerShell>
  );
};
