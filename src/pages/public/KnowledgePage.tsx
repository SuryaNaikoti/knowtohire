import React, { useState, useEffect, useCallback } from 'react';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { knowledgeService, KnowledgeResource } from '@/services/knowledgeService';
import {
  Search,
  BookOpen,
  AlertCircle,
  Sparkles,
  FilterX,
} from 'lucide-react';

const RESOURCE_CATEGORIES = [
  { value: 'all', label: 'All Resource Types' },
  { value: 'Environmental', label: 'Environmental Compliance' },
  { value: 'ESG', label: 'ESG & Sustainability' },
  { value: 'Patent', label: 'Patent & IPR' },
  { value: 'E-Book', label: 'E-Books & Handbooks' },
  { value: 'Study', label: 'Study Materials & Guides' },
];

export const KnowledgePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await knowledgeService.getResources({
      search: searchTerm.trim() || undefined,
      category: selectedCat !== 'all' ? selectedCat : undefined,
    });

    if (res.error) {
      setError(res.error.message);
      setResources([]);
    } else {
      setResources(res.data || []);
    }
    setIsLoading(false);
  }, [searchTerm, selectedCat]);

  useEffect(() => {
    const debounce = setTimeout(fetchResources, 200);
    return () => clearTimeout(debounce);
  }, [fetchResources]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCat('all');
  };

  const handleResourceClick = (res: KnowledgeResource) => {
    const targetPath = `/knowledge/${res.slug || res.id}`;
    window.history.pushState({}, '', targetPath);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="py-8 sm:py-12 bg-kth-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Page Hero Header */}
        <div className="mb-6 sm:mb-8 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200/80 mb-2.5 shadow-2xs">
            <Sparkles className="w-3 h-3 text-cyan-600" />
            <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider">
              Knowledge Ecosystem
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-kth-slate-900 tracking-tight leading-tight">
            Knowledge That Helps You Move Forward
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-kth-slate-600 mt-2 max-w-3xl leading-relaxed font-normal">
            Explore verified regulatory handbooks, ESG compliance guides, research papers, and technical study materials authored by accredited specialists across India.
          </p>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-kth-slate-200 shadow-xs mb-6 sm:mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search e-books, research guides, topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
            />
          </div>
          <div className="w-full sm:w-72 shrink-0">
            <Select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              options={RESOURCE_CATEGORIES}
            />
          </div>
        </div>

        {/* 3. Results Feedback Bar */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between text-xs text-kth-slate-500 mb-4 px-0.5">
            <div>
              Showing <strong className="text-kth-slate-900 font-semibold">{resources.length}</strong>{' '}
              {resources.length === 1 ? 'verified resource' : 'verified resources'}
              {(searchTerm || selectedCat !== 'all') && (
                <span> for your selected filters</span>
              )}
            </div>
            {(searchTerm || selectedCat !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-kth-primary-600 hover:text-kth-primary-700 h-7 px-2"
                onClick={handleClearFilters}
                leftIcon={<FilterX className="w-3.5 h-3.5" />}
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}

        {/* 4. Main Resource Grid or Loading / Error / Empty States */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-kth-slate-200/90 shadow-xs space-y-4 animate-pulse h-96 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-28 bg-kth-slate-200 rounded-md" />
                    <div className="h-5 w-12 bg-kth-slate-200 rounded-md" />
                  </div>
                  <div className="h-32 bg-kth-slate-100 rounded-xl w-full" />
                  <div className="h-4 bg-kth-slate-200 rounded w-4/5" />
                  <div className="h-3 bg-kth-slate-100 rounded w-1/2" />
                </div>
                <div className="pt-3 border-t border-kth-slate-100 flex justify-between items-center">
                  <div className="h-5 w-16 bg-kth-slate-200 rounded" />
                  <div className="h-8 w-24 bg-kth-slate-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-700 max-w-lg mx-auto shadow-xs my-8">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-red-900">Failed to Load Resources</h4>
            <p className="text-xs mt-1 text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
              onClick={fetchResources}
            >
              Try Again
            </Button>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white rounded-2xl border border-kth-slate-200 p-10 sm:p-14 text-center max-w-md mx-auto shadow-xs my-8">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center mx-auto mb-3.5">
              <BookOpen className="w-7 h-7" />
            </div>
            <h4 className="font-display font-bold text-base text-kth-slate-900 mb-1.5">
              No Resources Found
            </h4>
            <p className="text-xs text-kth-slate-500 mb-4 leading-relaxed">
              We couldn’t find any knowledge resources matching &ldquo;{searchTerm || selectedCat}&rdquo;. Try clearing filters or searching for general keywords like &ldquo;ESG&rdquo; or &ldquo;Patent&rdquo;.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {resources.map((res) => (
              <ResourceCard
                key={res.id}
                title={res.title}
                category={res.category}
                author={res.author || 'KnowToHire Regulatory Team'}
                format={res.format}
                pageCount={res.pageCount || 48}
                rating={res.rating}
                downloadCount={res.downloads_count}
                isFree={res.is_free ?? true}
                priceINR={res.price_inr}
                description={res.description}
                fileSize={res.file_size || '2.4 MB'}
                coverUrl={res.cover_url || undefined}
                onDownload={() => handleResourceClick(res)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
