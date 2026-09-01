import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { TemplateCard } from '@/components/cards/TemplateCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { templateService, MarketplaceTemplate } from '@/services/templateService';
import {
  Search,
  FileCheck2,
  AlertCircle,
  Sparkles,
  FilterX,
} from 'lucide-react';

const TEMPLATE_CATEGORIES = [
  { value: 'all', label: 'All Template Categories' },
  { value: 'Resume', label: 'ATS Resume & CV Templates' },
  { value: 'Contract', label: 'Business & Service Contracts' },
  { value: 'Legal', label: 'Legal & IP Agreements' },
  { value: 'Compliance', label: 'Compliance & Audit Checklists' },
];

export const CandidateTemplatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await templateService.getTemplates({
      search: searchTerm.trim() || undefined,
      category: selectedCat !== 'all' ? selectedCat : undefined,
    });

    if (res.error) {
      setError(res.error.message);
      setTemplates([]);
    } else {
      setTemplates(res.data || []);
    }
    setIsLoading(false);
  }, [searchTerm, selectedCat]);

  useEffect(() => {
    const debounce = setTimeout(fetchTemplates, 200);
    return () => clearTimeout(debounce);
  }, [fetchTemplates]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCat('all');
  };

  const handleTemplateClick = (tmpl: MarketplaceTemplate) => {
    const targetPath = `/templates/${tmpl.slug || tmpl.id}`;
    window.history.pushState({}, '', targetPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <CandidateShell title="Templates & Document Kits" currentPath="/candidate/templates">
      <div className="space-y-6 max-w-6xl mx-auto text-left font-sans">
        {/* Header Hero Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-kth-slate-200 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-2 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Document Frameworks
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kth-slate-900 leading-tight">
              Templates & Kits
            </h1>
            <p className="text-xs sm:text-sm text-kth-slate-600 mt-1 max-w-2xl leading-relaxed">
              Vetted ATS resume templates, NDAs, consulting contracts, and compliance checklists designed for professional workflows.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search resume layouts, contracts, checklists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
            />
          </div>
          <div className="w-full sm:w-72 shrink-0">
            <Select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              options={TEMPLATE_CATEGORIES}
            />
          </div>
        </div>

        {/* Results Feedback Bar */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between text-xs text-kth-slate-500 px-0.5">
            <div>
              Showing <strong className="text-kth-slate-900 font-semibold">{templates.length}</strong>{' '}
              {templates.length === 1 ? 'verified template' : 'verified templates'}
              {(searchTerm || selectedCat !== 'all') && (
                <span> for your selected criteria</span>
              )}
            </div>
            {(searchTerm || selectedCat !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-kth-primary-600 hover:text-kth-primary-700 font-semibold flex items-center gap-1"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-kth-slate-200 p-5 shadow-xs animate-pulse space-y-4"
              >
                <div className="h-28 bg-kth-slate-200 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-kth-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-kth-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-700 max-w-lg mx-auto shadow-xs my-8">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-red-900">Failed to Load Templates</h4>
            <p className="text-xs mt-1 text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
              onClick={fetchTemplates}
            >
              Try Again
            </Button>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-kth-slate-200 p-10 sm:p-14 text-center max-w-md mx-auto shadow-xs my-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3.5">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <h4 className="font-display font-bold text-base text-kth-slate-900 mb-1.5">
              No Templates Found
            </h4>
            <p className="text-xs text-kth-slate-500 mb-4 leading-relaxed">
              We couldn’t find any document templates matching &ldquo;{searchTerm || selectedCat}&rdquo;.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearFilters}
              leftIcon={<FilterX className="w-3.5 h-3.5" />}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {templates.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                title={tmpl.title}
                category={tmpl.category}
                format={tmpl.formats[0] || 'DOCX'}
                formats={tmpl.formats}
                priceINR={tmpl.price_inr}
                isFree={tmpl.is_free}
                downloads={tmpl.downloads_count}
                description={tmpl.description}
                onDownload={() => handleTemplateClick(tmpl)}
              />
            ))}
          </div>
        )}
      </div>
    </CandidateShell>
  );
};
