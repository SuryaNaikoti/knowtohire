import React, { useState, useEffect, useCallback } from 'react';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { knowledgeService, KnowledgeResource } from '@/services/knowledgeService';
import { Dialog } from '@/components/ui/Dialog';
import { requestService } from '@/services/requestService';
import {
  Search,
  BookOpen,
  AlertCircle,
  Sparkles,
  FilterX,
  PlusCircle,
  Send,
  CheckCircle2,
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

  // Content Request Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqCategory, setReqCategory] = useState('Technology');
  const [reqType, setReqType] = useState('Study Material');
  const [reqFormat, setReqFormat] = useState('PDF');
  const [reqAdditional, setReqAdditional] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);
  const [reqSuccess, setReqSuccess] = useState<string | null>(null);

  const handleOpenRequestModal = () => {
    setReqTitle('');
    setReqDescription('');
    setReqCategory(selectedCat !== 'all' ? selectedCat : 'Technology');
    setReqType('Study Material');
    setReqFormat('PDF');
    setReqAdditional('');
    setReqError(null);
    setReqSuccess(null);
    setIsRequestModalOpen(true);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqDescription.trim()) {
      setReqError('Please provide a title and detailed requirements for your request.');
      return;
    }

    setIsSubmittingReq(true);
    setReqError(null);

    const res = await requestService.createRequest({
      title: reqTitle.trim(),
      description: reqDescription.trim(),
      category: reqCategory,
      type: reqType,
      preferred_format: reqFormat,
      additional_requirements: reqAdditional.trim() || undefined,
    });

    setIsSubmittingReq(false);

    if (res.error) {
      setReqError(res.error.message);
    } else {
      setReqSuccess('Your content request has been submitted to the editorial review team!');
      setTimeout(() => {
        setIsRequestModalOpen(false);
        setReqSuccess(null);
      }, 1500);
    }
  };

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
        {/* 1. Page Hero Header with Request Content Action */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
          <div>
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

          <div className="shrink-0">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={handleOpenRequestModal}
              className="bg-kth-primary-600 hover:bg-kth-primary-700 font-bold shadow-xs whitespace-nowrap"
            >
              Request Custom Content
            </Button>
          </div>
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

      {/* 4. Request Custom Content Modal Dialog for all users */}
      <Dialog
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Custom Study Material / Resource"
        maxWidth="lg"
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4 text-left font-sans pt-1">
          <p className="text-xs text-kth-slate-600 leading-relaxed">
            Need a specialized guide, regulatory summary, or research dossier not listed in our catalog? Our subject matter team will review your request and publish it to the Knowledge Hub.
          </p>

          {reqError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{reqError}</span>
            </div>
          )}

          {reqSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{reqSuccess}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-kth-slate-800 block">
              Document / Topic Title <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. SEBI BRSR Core Phase 2 Assurance Guidelines & Checklist"
              value={reqTitle}
              onChange={(e) => setReqTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-800 block">Category</label>
              <Select
                value={reqCategory}
                onChange={(e) => setReqCategory(e.target.value)}
                options={[
                  { value: 'Technology', label: 'Engineering & Technology' },
                  { value: 'Sustainability', label: 'Sustainability & ESG' },
                  { value: 'Environmental', label: 'Environmental Compliance' },
                  { value: 'Patent', label: 'Patent & Intellectual Property' },
                  { value: 'Public Policy', label: 'Public Policy & Legal' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-800 block">Content Type</label>
              <Select
                value={reqType}
                onChange={(e) => setReqType(e.target.value)}
                options={[
                  { value: 'Study Material', label: 'Study Material' },
                  { value: 'Regulatory Guide', label: 'Regulatory Guide' },
                  { value: 'E-Book', label: 'E-Book / Handbook' },
                  { value: 'White Paper', label: 'White Paper / Research' },
                  { value: 'Compliance Checklist', label: 'Compliance Checklist' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-800 block">Preferred Format</label>
              <Select
                value={reqFormat}
                onChange={(e) => setReqFormat(e.target.value)}
                options={[
                  { value: 'PDF', label: 'PDF Document' },
                  { value: 'EPUB', label: 'EPUB E-Reader' },
                  { value: 'DOCX', label: 'Editable DOCX' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-kth-slate-800 block">
              Detailed Scope & Chapters Needed <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe the exact requirements, key topics to cover, specific statutes or frameworks to address, and intended use cases..."
              value={reqDescription}
              onChange={(e) => setReqDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-kth-slate-300 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-kth-slate-800 block">
              Additional Notes (Optional)
            </label>
            <Input
              placeholder="Any specific authors, reference links, or target deadlines..."
              value={reqAdditional}
              onChange={(e) => setReqAdditional(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-kth-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRequestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingReq}
              disabled={isSubmittingReq}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="bg-kth-primary-600 hover:bg-kth-primary-700 font-bold"
            >
              Submit Content Request
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
