import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/public/SectionHeader';
import { TemplateCard } from '@/components/cards/TemplateCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { templateService, MarketplaceTemplate } from '@/services/templateService';
import { Search, Loader2, FileCheck, AlertCircle } from 'lucide-react';

export const TemplatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);
      const res = await templateService.getTemplates({
        search: searchTerm,
        category: selectedCat,
      });

      if (!isMounted) return;
      if (res.error) {
        setError(res.error.message);
      } else {
        setTemplates(res.data || []);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchTemplates, 250);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [searchTerm, selectedCat]);

  return (
    <div className="py-12 bg-kth-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Digital Resource Marketplace"
          badgeVariant="indigo"
          title="Professional Templates, Ready to Use"
          subtitle="ATS-optimized resumes, EIA consultancy contracts, and corporate ESG compliance checklists."
        />

        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search resume, contract, or compliance templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              options={[
                { value: 'all', label: 'All Template Categories' },
                { value: 'Resume', label: 'Resume Templates' },
                { value: 'Contract', label: 'Business Contracts' },
                { value: 'Legal', label: 'Legal & IP Agreements' },
                { value: 'Compliance', label: 'Compliance Checklists' },
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">Loading professional templates...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-bold text-sm">Failed to Load Templates</h4>
            <p className="text-xs mt-1 text-red-600">{error}</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-xl border border-kth-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <FileCheck className="w-10 h-10 text-kth-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-base text-kth-slate-900 mb-1">No Templates Found</h4>
            <p className="text-xs text-kth-slate-500 mb-4">Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                title={tmpl.title}
                category={tmpl.category}
                format={tmpl.formats[0] || 'DOCX'}
                priceINR={tmpl.price_inr}
                isFree={tmpl.is_free}
                downloads={tmpl.downloads_count}
                onDownload={() => {
                  window.location.href = `/templates/${tmpl.slug || tmpl.id}`;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
