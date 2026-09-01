import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { knowledgeService, KnowledgeResource } from '@/services/knowledgeService';
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
  { value: 'Technology', label: 'Technology & Architecture' },
  { value: 'Environmental', label: 'Environmental Compliance' },
  { value: 'ESG', label: 'ESG & Sustainability' },
  { value: 'Patent', label: 'Patent & IPR' },
  { value: 'E-Book', label: 'E-Books & Handbooks' },
  { value: 'Study', label: 'Study Materials & Guides' },
];

export const EmployerKnowledgePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Content Request Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqCategory, setReqCategory] = useState('Technology');
  const [reqType, setReqType] = useState('Regulatory Guide');
  const [reqFormat, setReqFormat] = useState('PDF');
  const [reqAdditional, setReqAdditional] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);
  const [reqSuccess, setReqSuccess] = useState<string | null>(null);

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

  const handleOpenRequestModal = () => {
    setReqTitle('');
    setReqDescription('');
    setReqCategory(selectedCat !== 'all' ? selectedCat : 'Technology');
    setReqType('Regulatory Guide');
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
      setReqSuccess('Your corporate content request has been submitted to the editorial review team!');
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
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <EmployerShell title="Knowledge Hub & Compliance" currentPath="/employer/knowledge">
      <div className="space-y-6 max-w-7xl mx-auto text-left font-sans">
        {/* Header Hero Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-kth-slate-200 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200/80 mb-2 shadow-2xs">
              <Sparkles className="w-3 h-3 text-cyan-600" />
              <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider">
                Enterprise Knowledge Library
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kth-slate-900 leading-tight">
              Knowledge Hub
            </h1>
            <p className="text-xs sm:text-sm text-kth-slate-600 mt-1 max-w-3xl leading-relaxed">
              Explore regulatory handbooks, SEBI BRSR compliance guidelines, corporate hiring standards, and engineering architecture blueprints.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={handleOpenRequestModal}
              className="bg-kth-primary-600 hover:bg-kth-primary-700 font-bold shadow-xs whitespace-nowrap"
            >
              Request Custom Dossier
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search compliance handbooks, research dossiers, technical topics..."
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

        {/* Results Feedback Bar */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between text-xs text-kth-slate-500 px-0.5">
            <div>
              Showing <strong className="text-kth-slate-900 font-semibold">{resources.length}</strong>{' '}
              {resources.length === 1 ? 'verified resource' : 'verified resources'}
              {(searchTerm || selectedCat !== 'all') && (
                <span> for your selected filters</span>
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

        {/* Resource Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-kth-slate-200 p-5 shadow-xs animate-pulse space-y-4"
              >
                <div className="h-32 bg-kth-slate-200 rounded-xl" />
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
              We couldn’t find any knowledge resources matching &ldquo;{searchTerm || selectedCat}&rdquo;.
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

        {/* Content Request Modal */}
        <Dialog
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          title="Request Enterprise Knowledge Dossier"
          maxWidth="lg"
        >
          <form onSubmit={handleRequestSubmit} className="space-y-4 text-left font-sans pt-1">
            <p className="text-xs text-kth-slate-600 leading-relaxed">
              Request a custom compliance handbook, corporate policy document, or technical hiring rubric tailored for your industry.
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
                Dossier / Topic Title <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Enterprise Cloud Security Audit & SOC2 Preparation Dossier"
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
                    { value: 'Public Policy', label: 'Corporate Legal & Governance' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-kth-slate-800 block">Content Type</label>
                <Select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                  options={[
                    { value: 'Regulatory Guide', label: 'Regulatory Guide' },
                    { value: 'Compliance Checklist', label: 'Compliance Checklist' },
                    { value: 'Study Material', label: 'Study Material / Rubric' },
                    { value: 'White Paper', label: 'White Paper / Research' },
                    { value: 'E-Book', label: 'E-Book / Handbook' },
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
                    { value: 'DOCX', label: 'Editable DOCX' },
                    { value: 'EPUB', label: 'EPUB E-Reader' },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-800 block">
                Detailed Scope & Objectives <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Explain the regulatory standards, specific technical guidelines, or hiring frameworks your team requires..."
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-kth-slate-300 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-800 block">
                Additional References or Context
              </label>
              <Input
                placeholder="Any specific statutory bodies, deadlines, or source documents..."
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
                Submit Enterprise Request
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </EmployerShell>
  );
};
