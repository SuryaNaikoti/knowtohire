import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import {
  taxonomyService,
  CareerCategory,
  Industry,
  DomainItem,
  JobRole,
  SkillItem,
  Country,
  StateRegion,
  CityItem,
} from '@/services';
import {
  Globe,
  Layers,
  Briefcase,
  Award,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  FolderTree,
} from 'lucide-react';

type TaxonomyTab = 'categories' | 'industries' | 'domains' | 'roles' | 'skills' | 'geography';

export const AdminTaxonomyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TaxonomyTab>('categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Taxonomy Lists
  const [categories, setCategories] = useState<CareerCategory[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<StateRegion[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);

  // Create Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCategory] = useState('');
  const [newRoleSeniority, setNewRoleSeniority] = useState('mid_level');

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Software Engineering');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    const [catRes, indRes, domRes, roleRes, skillRes, countryRes, stateRes, cityRes] = await Promise.all([
      taxonomyService.getCareerCategories(true),
      taxonomyService.getIndustries(true),
      taxonomyService.getDomains(),
      taxonomyService.searchJobRoles(),
      taxonomyService.searchSkills(),
      taxonomyService.getCountries(),
      taxonomyService.getStates('country-in'),
      taxonomyService.searchCities('', 'country-in'),
    ]);

    if (catRes.data) setCategories(catRes.data);
    if (indRes.data) setIndustries(indRes.data);
    if (domRes.data) setDomains(domRes.data);
    if (roleRes.data) setRoles(roleRes.data);
    if (skillRes.data) setSkills(skillRes.data);
    if (countryRes.data) setCountries(countryRes.data);
    if (stateRes.data) setStates(stateRes.data);
    if (cityRes.data) setCities(cityRes.data);
  };

  useEffect(() => {
    loadData();
    const handleTaxChange = () => loadData();
    window.addEventListener('kth_taxonomy_changed', handleTaxChange);
    return () => window.removeEventListener('kth_taxonomy_changed', handleTaxChange);
  }, []);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    const res = await taxonomyService.createCareerCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim(),
    });
    if (res.data) {
      setSuccessMessage(`Created category: ${res.data.name}`);
      setNewCatName('');
      setNewCatDesc('');
      setIsCategoryModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    const res = await taxonomyService.createJobRole({
      name: newRoleName.trim(),
      career_category_id: newRoleCategory || undefined,
      seniority_level: newRoleSeniority,
    });
    if (res.data) {
      setSuccessMessage(`Created job role: ${res.data.name}`);
      setNewRoleName('');
      setIsRoleModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) return;
    const res = await taxonomyService.createSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
    });
    if (res.data) {
      setSuccessMessage(`Created skill: ${res.data.name}`);
      setNewSkillName('');
      setIsSkillModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleToggleCategoryActive = async (cat: CareerCategory) => {
    await taxonomyService.updateCareerCategory(cat.id, { is_active: !cat.is_active });
    loadData();
  };

  return (
    <AdminShell title="Master Taxonomy & Geography" currentPath="/admin/taxonomy">
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="slate" className="bg-kth-slate-100 text-kth-slate-700 font-mono text-[10px]">
                SINGLE SOURCE OF TRUTH
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-kth-slate-900">
              Master Taxonomy & Geography
            </h1>
            <p className="text-xs sm:text-sm text-kth-slate-600">
              Manage canonical classifications, job roles, skills, and global geographic records across KnowToHire.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === 'categories' && (
              <Button size="sm" onClick={() => setIsCategoryModalOpen(true)} className="bg-kth-slate-900 text-white hover:bg-black gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </Button>
            )}
            {activeTab === 'roles' && (
              <Button size="sm" onClick={() => setIsRoleModalOpen(true)} className="bg-kth-slate-900 text-white hover:bg-black gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Job Role</span>
              </Button>
            )}
            {activeTab === 'skills' && (
              <Button size="sm" onClick={() => setIsSkillModalOpen(true)} className="bg-kth-slate-900 text-white hover:bg-black gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </Button>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-kth-slate-200 overflow-x-auto pb-1">
          {[
            { key: 'categories', label: 'Career Categories', count: categories.length, icon: Layers },
            { key: 'industries', label: 'Industries', count: industries.length, icon: Building2 },
            { key: 'domains', label: 'Domains', count: domains.length, icon: FolderTree },
            { key: 'roles', label: 'Job Roles', count: roles.length, icon: Briefcase },
            { key: 'skills', label: 'Skills & Aliases', count: skills.length, icon: Award },
            { key: 'geography', label: 'Geography (IN & Global)', count: countries.length + cities.length, icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as TaxonomyTab); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-kth-slate-900 text-white shadow-sm'
                    : 'text-kth-slate-600 hover:bg-white hover:text-kth-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-kth-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isActive ? 'bg-kth-slate-800 text-amber-300' : 'bg-kth-slate-200 text-kth-slate-700'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-kth-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Tab 1: Categories */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories
              .filter((c) => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((cat) => (
                <Card key={cat.id} className="p-4 flex flex-col justify-between border-kth-slate-200 hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-sm text-kth-slate-900">{cat.name}</span>
                      <Badge variant={cat.is_active ? 'emerald' : 'slate'}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-kth-slate-500 mb-3">{cat.description || 'No description provided.'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-kth-slate-100 text-[11px] text-kth-slate-400 font-mono">
                    <span>slug: {cat.slug}</span>
                    <button
                      onClick={() => handleToggleCategoryActive(cat)}
                      className="text-xs font-semibold text-kth-slate-700 hover:text-kth-slate-900 underline"
                    >
                      {cat.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Tab 2: Industries */}
        {activeTab === 'industries' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries
              .filter((i) => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((ind) => (
                <Card key={ind.id} className="p-4 border-kth-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-kth-slate-900">{ind.name}</span>
                    <Badge variant="slate" className="font-mono text-[10px]">
                      Sort #{ind.sort_order}
                    </Badge>
                  </div>
                  <p className="text-xs text-kth-slate-500">{ind.description}</p>
                </Card>
              ))}
          </div>
        )}

        {/* Tab 3: Domains */}
        {activeTab === 'domains' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains
              .filter((d) => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((dom) => (
                <Card key={dom.id} className="p-4 border-kth-slate-200">
                  <span className="font-bold text-sm text-kth-slate-900 block mb-1">{dom.name}</span>
                  <span className="text-[11px] text-kth-slate-500 font-mono block">slug: {dom.slug}</span>
                </Card>
              ))}
          </div>
        )}

        {/* Tab 4: Roles */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles
              .filter((r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((role) => (
                <Card key={role.id} className="p-4 border-kth-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-kth-slate-900">{role.name}</span>
                      <Badge variant="slate" className="capitalize text-[10px]">
                        {role.seniority_level?.replace('_', ' ') || 'Mid Level'}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-kth-slate-400 font-mono">slug: {role.slug}</span>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Tab 5: Skills */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {skills
              .filter((s) => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((skill) => (
                <div key={skill.id} className="p-3 bg-white border border-kth-slate-200 rounded-xl shadow-2xs text-center">
                  <span className="font-bold text-xs text-kth-slate-900 block truncate">{skill.name}</span>
                  <span className="text-[10px] text-kth-slate-500 block truncate">{skill.category}</span>
                </div>
              ))}
          </div>
        )}

        {/* Tab 6: Geography */}
        {activeTab === 'geography' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-sm text-kth-slate-900 mb-3">Global Countries ({countries.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {countries.map((c) => (
                  <div key={c.id} className="p-3 bg-white border border-kth-slate-200 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-bold text-kth-slate-900">{c.name}</span>
                    <span className="font-mono text-[10px] bg-kth-slate-100 px-1.5 py-0.5 rounded text-kth-slate-600">{c.iso2} ({c.phone_code})</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-kth-slate-900 mb-3">Indian States & Union Territories ({states.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {states.map((s) => (
                  <div key={s.id} className="p-2.5 bg-white border border-kth-slate-200 rounded-lg text-xs flex justify-between items-center">
                    <span className="font-medium text-kth-slate-800">{s.name}</span>
                    <span className="font-mono text-[10px] text-kth-slate-400">{s.state_code}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-kth-slate-900 mb-3">Metropolitan & Tech Cities ({cities.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {cities.map((city) => (
                  <div key={city.id} className="p-3 bg-white border border-kth-slate-200 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-bold text-kth-slate-900">{city.name}</span>
                    {city.is_popular && (
                      <Badge variant="emerald" className="text-[10px]">Popular Hub</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dialog: Add Category */}
        <Dialog
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title="Create New Career Category"
          description="Add a new top-level classification category to KnowToHire."
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-kth-slate-700 block mb-1">Category Name</label>
              <Input placeholder="e.g. Cleantech & Carbon Management" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-kth-slate-700 block mb-1">Description</label>
              <Input placeholder="Brief explanation of career path..." value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateCategory} className="bg-kth-slate-900 text-white">Save Category</Button>
            </div>
          </div>
        </Dialog>

        {/* Dialog: Add Role */}
        <Dialog
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          title="Create Canonical Job Role"
          description="Define a normalized job role to link with employer titles."
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-kth-slate-700 block mb-1">Role Name</label>
              <Input placeholder="e.g. Solutions Architect" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-kth-slate-700 block mb-1">Seniority Level</label>
              <Select
                value={newRoleSeniority}
                onChange={(e) => setNewRoleSeniority(e.target.value)}
                options={[
                  { value: 'fresher', label: 'Fresher' },
                  { value: 'associate', label: 'Associate' },
                  { value: 'mid_level', label: 'Mid Level' },
                  { value: 'senior', label: 'Senior' },
                  { value: 'lead', label: 'Lead / Principal' },
                ]}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateRole} className="bg-kth-slate-900 text-white">Save Role</Button>
            </div>
          </div>
        </Dialog>

        {/* Dialog: Add Skill */}
        <Dialog
          isOpen={isSkillModalOpen}
          onClose={() => setIsSkillModalOpen(false)}
          title="Create Standardized Skill"
          description="Add a verified technical, ESG, or domain skill."
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-kth-slate-700 block mb-1">Skill Name</label>
              <Input placeholder="e.g. GraphQL Federation" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-kth-slate-700 block mb-1">Category</label>
              <Select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                options={[
                  { value: 'Software Engineering', label: 'Software Engineering' },
                  { value: 'ESG & Reporting', label: 'ESG & Reporting' },
                  { value: 'Sustainability', label: 'Sustainability' },
                  { value: 'Intellectual Property', label: 'Intellectual Property' },
                  { value: 'Environmental Engineering', label: 'Environmental Engineering' },
                ]}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsSkillModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateSkill} className="bg-kth-slate-900 text-white">Save Skill</Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AdminShell>
  );
};
