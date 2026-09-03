import React, { useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { taxonomyService } from '@/services/taxonomyService';
import { navigateTo } from '@/utils/navigation';
import {
  ArrowLeft,
  Tag,
  Briefcase,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AdminTaxonomyNewPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminTaxonomyNewPage: React.FC<AdminTaxonomyNewPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'role' | 'skill'>('category');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Category fields
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Role fields
  const [roleName, setRoleName] = useState('');
  const [roleSeniority, setRoleSeniority] = useState('senior');
  const [roleCategory, setRoleCategory] = useState('Software Engineering');

  // Skill fields
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Software Engineering');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (activeTab === 'category') {
        if (!catName.trim()) {
          setError('Category name is required.');
          setIsSaving(false);
          return;
        }
        await taxonomyService.createCareerCategory({
          name: catName.trim(),
          description: catDesc.trim(),
        });
        setSuccessMessage('Category created and synchronized.');
      } else if (activeTab === 'role') {
        if (!roleName.trim()) {
          setError('Role title is required.');
          setIsSaving(false);
          return;
        }
        await taxonomyService.createJobRole({
          name: roleName.trim(),
          seniority_level: roleSeniority as any,
          career_category_id: 'cat-tech',
        });
        setSuccessMessage('Canonical role created and mapped.');
      } else if (activeTab === 'skill') {
        if (!skillName.trim()) {
          setError('Skill name is required.');
          setIsSaving(false);
          return;
        }
        await taxonomyService.createSkill({
          name: skillName.trim(),
          category: skillCategory,
        });
        setSuccessMessage('Standardized skill added to taxonomy.');
      }

      setTimeout(() => {
        handleBack();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Failed to save taxonomy item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/admin/taxonomy');
    } else {
      navigateTo('/admin/taxonomy');
    }
  };

  return (
    <AdminShell title="Master Taxonomy Governance" currentPath="/admin/taxonomy" onNavigate={onNavigate}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Taxonomy Registry</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-kth-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 ${
              activeTab === 'category'
                ? 'bg-kth-slate-900 text-white shadow-xs'
                : 'bg-white border border-kth-slate-200 text-kth-slate-600 hover:bg-kth-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Career Category</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('role')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 ${
              activeTab === 'role'
                ? 'bg-kth-slate-900 text-white shadow-xs'
                : 'bg-white border border-kth-slate-200 text-kth-slate-600 hover:bg-kth-slate-50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Canonical Role</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skill')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 ${
              activeTab === 'skill'
                ? 'bg-kth-slate-900 text-white shadow-xs'
                : 'bg-white border border-kth-slate-200 text-kth-slate-600 hover:bg-kth-slate-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Standardized Skill</span>
          </button>
        </div>

        {/* Content Form */}
        <Card className="p-6 sm:p-8 bg-white border-kth-slate-200 shadow-sm">
          <form onSubmit={handleSave} className="space-y-5">
            {activeTab === 'category' && (
              <div className="space-y-4">
                <div className="border-b border-kth-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-kth-slate-900">Define New Career Category</h3>
                  <p className="text-xs text-kth-slate-500">Top-level domain for organizing industry tracks and skill taxonomy.</p>
                </div>

                <Input
                  label="Category Name *"
                  placeholder="e.g. Cleantech & Carbon Management"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-kth-slate-700">
                    Category Scope & Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Brief explanation of career path, industry scope, and typical enterprise employers..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeTab === 'role' && (
              <div className="space-y-4">
                <div className="border-b border-kth-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-kth-slate-900">Define Canonical Job Role</h3>
                  <p className="text-xs text-kth-slate-500">Standardized role benchmark to normalize job postings and candidate profiles.</p>
                </div>

                <Input
                  label="Role Title *"
                  placeholder="e.g. Lead Sustainability & Carbon Auditor"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Seniority Level"
                    value={roleSeniority}
                    onChange={(e) => setRoleSeniority(e.target.value)}
                    options={[
                      { value: 'fresher', label: 'Fresher / Graduate' },
                      { value: 'associate', label: 'Associate / Junior' },
                      { value: 'mid_level', label: 'Mid-Level Professional' },
                      { value: 'senior', label: 'Senior Specialist' },
                      { value: 'lead', label: 'Lead / Principal / Director' },
                    ]}
                  />

                  <Select
                    label="Parent Domain Category"
                    value={roleCategory}
                    onChange={(e) => setRoleCategory(e.target.value)}
                    options={[
                      { value: 'Software Engineering', label: 'Software Engineering' },
                      { value: 'Environmental & Sustainability', label: 'Environmental & Sustainability' },
                      { value: 'Patent & Intellectual Property', label: 'Patent & Intellectual Property' },
                      { value: 'Data & Analytics', label: 'Data & Analytics' },
                      { value: 'Operations & Compliance', label: 'Operations & Compliance' },
                    ]}
                  />
                </div>
              </div>
            )}

            {activeTab === 'skill' && (
              <div className="space-y-4">
                <div className="border-b border-kth-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-kth-slate-900">Define Standardized Technical / Domain Skill</h3>
                  <p className="text-xs text-kth-slate-500">Normalized skill token for ATS resume matching, search filtering, and candidate tagging.</p>
                </div>

                <Input
                  label="Skill Name *"
                  placeholder="e.g. BRSR Core Assurance / Scope 1 Carbon Accounting"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  required
                />

                <Select
                  label="Skill Classification Category"
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  options={[
                    { value: 'Software Engineering', label: 'Software Engineering' },
                    { value: 'Environmental & Sustainability', label: 'Environmental & Sustainability' },
                    { value: 'Patent & Intellectual Property', label: 'Patent & Intellectual Property' },
                    { value: 'Data & Analytics', label: 'Data & Analytics' },
                    { value: 'Compliance & Legal', label: 'Compliance & Legal' },
                  ]}
                />
              </div>
            )}

            <div className="pt-4 border-t border-kth-slate-100 flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={handleBack}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
                isLoading={isSaving}
                className="bg-kth-slate-900 text-white font-bold"
              >
                Save to Master Taxonomy
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminShell>
  );
};
