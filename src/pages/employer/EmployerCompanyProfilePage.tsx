import React, { useState, useEffect } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { taxonomyService, Industry, CityItem } from '@/services';
import { MapPin, Users, CheckCircle2, ExternalLink, Loader2, Check } from 'lucide-react';

export const EmployerCompanyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [industriesList, setIndustriesList] = useState<Industry[]>([]);
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);

  const [company, setCompany] = useState<{
    id?: string;
    name: string;
    industry: string;
    location: string;
    size: string;
    website: string;
    about: string;
    verification_status: string;
  }>({
    name: 'Enterprise Organization',
    industry: 'Environment & Sustainability',
    location: 'Bengaluru, Karnataka, India',
    size: '50-250 Employees',
    website: 'https://knowtohire.com',
    about: 'Leading enterprise dedicated to environmental stewardship, ESG compliance, and sustainable engineering.',
    verification_status: 'verified',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadTaxonomy() {
      const [indRes, citiesRes] = await Promise.all([
        taxonomyService.getIndustries(),
        taxonomyService.searchCities('', 'country-in'),
      ]);
      if (indRes.data) setIndustriesList(indRes.data);
      if (citiesRes.data) setCitiesList(citiesRes.data);
    }
    loadTaxonomy();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCompany = async () => {
      if (!user) return;
      setIsLoading(true);

      const { data: emp } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (emp?.company_id) {
        const { data: comp } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('id', emp.company_id)
          .maybeSingle();

        if (!isMounted) return;
        if (comp) {
          setCompany({
            id: comp.id,
            name: comp.name || 'Enterprise Organization',
            industry: comp.industry || 'Environment & Sustainability',
            location: comp.headquarters_location || 'Bengaluru, Karnataka, India',
            size: comp.company_size || '50-200 Employees',
            website: comp.website_url || 'https://knowtohire.com',
            about: comp.about || 'Specialized enterprise delivering environmental compliance and clean innovation solutions.',
            verification_status: comp.verification_status || 'verified',
          });
        }
      }
      setIsLoading(false);
    };

    fetchCompany();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSave = async () => {
    if (!company.id) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    await supabase.from('company_profiles').update({
      name: company.name,
      industry: company.industry,
      headquarters_location: company.location,
      website_url: company.website,
    }).eq('id', company.id);

    setIsSaving(false);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <EmployerShell title="Company Profile Management" currentPath="/employer/company-profile">
      <div className="max-w-5xl mx-auto space-y-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500">Loading enterprise profile data...</p>
          </div>
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
                        {company.verification_status.replace('_', ' ')}
                      </Badge>
                      {saveSuccess && (
                        <Badge variant="emerald" className="flex items-center gap-1">
                          <Check className="w-3 h-3" /> Changes Saved
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-kth-slate-700 mb-1">{company.industry}</p>
                    <div className="flex items-center gap-4 text-xs text-kth-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-kth-slate-400" /> {company.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-kth-slate-400" /> {company.size}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={isEditing ? 'primary' : 'outline'}
                    size="sm"
                    isLoading={isSaving}
                    onClick={() => {
                      if (isEditing) handleSave();
                      else setIsEditing(true);
                    }}
                  >
                    {isEditing ? 'Save Profile' : 'Edit Company Info'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ExternalLink className="w-4 h-4" />}
                    onClick={() => window.open(company.website, '_blank')}
                  >
                    Visit Website
                  </Button>
                </div>
              </div>
            </Card>

            {isEditing ? (
              <Card className="p-6 space-y-4">
                <h3 className="font-display font-bold text-base text-kth-slate-900 mb-2">Edit Enterprise Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Legal Name"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  />
                  <SearchableCombobox
                    label="Industry Sector"
                    value={company.industry}
                    onChange={(val) => setCompany({ ...company, industry: val })}
                    placeholder="Select industry sector..."
                    searchPlaceholder="Filter industries..."
                    options={industriesList.map((ind) => ({
                      value: ind.name,
                      label: ind.name,
                    }))}
                  />
                  <SearchableCombobox
                    label="Headquarters Location"
                    value={company.location}
                    onChange={(val) => setCompany({ ...company, location: val })}
                    placeholder="Search canonical hub or city..."
                    searchPlaceholder="Filter city..."
                    options={citiesList.map((c) => ({
                      value: `${c.name}, India`,
                      label: `${c.name}, India`,
                      category: c.is_popular ? 'Metropolitan Hub' : 'Regional City',
                    }))}
                  />
                  <Input
                    label="Website URL"
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  />
                </div>
              </Card>
            ) : null}

            {/* Company Description */}
            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-3">About the Enterprise</h3>
              <p className="text-sm text-kth-slate-700 leading-relaxed">{company.about}</p>
            </Card>

            {/* Culture & Hiring Benefits */}
            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4">
                Workplace Culture & Candidate Perks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-kth-slate-700">
                <div className="flex items-center gap-2 bg-kth-slate-50 p-3 rounded-lg border border-kth-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hybrid & Flexible Work Policy across major Indian hubs</span>
                </div>
                <div className="flex items-center gap-2 bg-kth-slate-50 p-3 rounded-lg border border-kth-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Comprehensive Health & Group Term Life Insurance</span>
                </div>
                <div className="flex items-center gap-2 bg-kth-slate-50 p-3 rounded-lg border border-kth-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Continuous Professional Development & SPCB/BRSR Certifications</span>
                </div>
                <div className="flex items-center gap-2 bg-kth-slate-50 p-3 rounded-lg border border-kth-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Decarbonization & Clean Energy R&D projects</span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </EmployerShell>
  );
};
