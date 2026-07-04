import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockTemplates } from '../../constants/mockData';
import type { Template } from '../../constants/mockData';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { EmptyState, CardSkeleton } from '../../components/ui/Skeleton';
import { Search, SlidersHorizontal, Star, ArrowUpRight, HelpCircle, FileSpreadsheet } from 'lucide-react';

/* ── Reusable Dot Grid Background ── */
const DotGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotgrid-templates" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid-templates)" />
    </svg>
  </div>
);

export const TemplatesListing: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  // Filter & Sort templates
  const filteredTemplates = mockTemplates.filter((temp: Template) => {
    return (
      temp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temp.creator.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price;
    if (sortOrder === 'price-desc') return b.price - a.price;
    return 0; // Default
  });

  return (
    <div className="bg-slate-50/30 flex-1 w-full min-h-screen animate-fade-in-up">
      {/* Editorial Header Panel */}
      <div className="relative bg-white border-b border-slate-150 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
        <DotGrid className="text-slate-400 opacity-25" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-6 relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Digital Assets</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-heading text-slate-900 tracking-tight leading-none">
            Templates <span className="kth-gradient-text">Marketplace</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
            Premium resume formats, portfolio layouts, business decks, and automated spreadsheets vetted by career planners.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 w-full flex flex-col space-y-8">
        
        {/* Filters Toolbar */}
        <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search resumes, pitch decks, guides..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); simulateLoading(); }}
              className="w-full pl-10 pr-4 py-3 text-xs font-medium border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Search templates"
            />
          </div>

          {/* Sorting Dropdown */}
          <div className="flex gap-3 w-full sm:w-auto self-stretch sm:self-auto justify-between sm:justify-end items-center border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
            <label htmlFor="sort-select" className="text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0 select-none">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Sort
            </label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSortOrder(e.target.value as 'default' | 'price-asc' | 'price-desc'); simulateLoading(); }}
              className="w-full sm:w-44 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer h-10 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="default">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : sortedTemplates.length > 0 ? (
            sortedTemplates.map((temp) => (
              <Card
                key={temp.id}
                hoverEffect
                className="hover:shadow-premium hover:-translate-y-1.5 border border-slate-200 relative flex flex-col group shadow-sm bg-white overflow-hidden rounded-[24px] text-left focus:ring-2 focus:ring-emerald-500/20"
              >
                {/* Cover Mockup */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden shrink-0 border-b border-slate-150">
                  <img
                    src={temp.coverUrl}
                    alt={`${temp.title} preview`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl shadow-md select-none font-heading">
                    ₹{temp.price}
                  </span>
                </div>

                {/* Card Body */}
                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    {/* Creator avatar */}
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={temp.creatorAvatar}
                        alt={temp.creator}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                      <span className="text-[10px] text-slate-450 font-bold truncate">{temp.creator}</span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading leading-snug">
                      {temp.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                      {temp.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-3 border-t border-slate-100 mt-auto">
                    {/* Formats support */}
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase">
                      <span className="flex items-center gap-1 flex-wrap">
                        {temp.formats.map((form) => (
                          <span key={form} className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded text-[8px] font-extrabold select-none">
                            {form}
                          </span>
                        ))}
                      </span>
                      <span className="flex items-center gap-1 font-extrabold text-slate-700">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" /> {temp.rating} <span className="text-slate-300">•</span> {temp.downloadsCount} Sold
                      </span>
                    </div>

                    <Link to={`/templates/${temp.id}`} className="block">
                      <Button variant="primary" size="sm" className="w-full text-xs font-bold h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-emerald-500/20">
                        <span>Get Template</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState 
                title="No assets match your search"
                description="Try clearing the filters or searching for alternative keywords like 'Resume' or 'Financial Model'."
                icon={<HelpCircle className="h-12 w-12 text-slate-300" />}
                actionText="Clear Search"
                onAction={() => setSearchQuery('')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesListing;
