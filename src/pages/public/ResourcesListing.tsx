import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockResources } from '../../constants/mockData';
import type { Resource } from '../../constants/mockData';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { EmptyState, CardSkeleton } from '../../components/ui/Skeleton';
import { Search, GraduationCap, Star, Info, BookOpen } from 'lucide-react';

/* ── Reusable Dot Grid Background ── */
const DotGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotgrid-resources" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid-resources)" />
    </svg>
  </div>
);

export const ResourcesListing: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const categories = ['All', 'Engineering', 'Management', 'Finance', 'ESG & Sustainability'];

  const filteredResources = mockResources.filter((res: Resource) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeTab === 'All' || res.category === activeTab || (activeTab === 'ESG & Sustainability' && res.category === 'ESG');

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50/30 flex-1 w-full min-h-screen animate-fade-in-up">
      {/* Editorial Header Panel */}
      <div className="relative bg-white border-b border-slate-150 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
        <DotGrid className="text-slate-400 opacity-25" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-6 relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Knowledge Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-heading text-slate-900 tracking-tight leading-none">
            Study Hub <span className="kth-gradient-text">Resources</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
            Access high-caliber e-books, training guides, checklists, and valuation models curated by career intelligence experts.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 w-full flex flex-col space-y-8">
        
        {/* Filter Tabs & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Category Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-1 select-none scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveTab(cat); simulateLoading(); }}
              className={`px-5 py-3 text-xs font-bold shrink-0 transition-all border-b-2 cursor-pointer whitespace-nowrap focus:ring-2 focus:ring-emerald-500/20
                ${activeTab === cat ? 'border-emerald-650 text-emerald-655' : 'border-transparent text-slate-400 hover:text-slate-900'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search e-books, manuals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs font-medium border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
              aria-label="Search resources"
            />
          </div>
        </div>

        {/* Resources Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : filteredResources.length > 0 ? (
            filteredResources.map((res) => (
              <Card
                key={res.id}
                hoverEffect
                className="hover:shadow-premium hover:-translate-y-1.5 border border-slate-200 transition-all flex flex-col group overflow-hidden bg-white shadow-sm rounded-[24px] text-left focus:ring-2 focus:ring-emerald-500/20"
              >
                {/* Cover Mockup Image */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden shrink-0 border-b border-slate-150">
                  <img
                    src={res.coverUrl}
                    alt={`${res.title} cover`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest text-white bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-md select-none">
                    {res.format}
                  </span>
                </div>

                {/* Card Body */}
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded select-none uppercase tracking-wide">
                      {res.category} Category
                    </span>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mt-1 leading-snug">
                      {res.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-normal line-clamp-3 mb-4 leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  <div className="mt-auto">
                    {/* Metadata Indicators */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-t border-slate-100 pt-4 mb-4">
                      <span className="flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-slate-300" />
                        {res.fileSize}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {res.rating} ({res.downloadsCount} downloads)
                      </span>
                    </div>

                    <Link to={`/resources/${res.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full font-bold text-xs h-10 rounded-xl hover:bg-slate-50 border-slate-200 flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-emerald-500/20">
                        <BookOpen className="w-4 h-4 text-slate-500" />
                        <span>View Details & Download</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState 
                title="No resources found"
                description="Try searching with a different category or keywords."
                icon={<BookOpen className="h-12 w-12 text-slate-300" />}
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

export default ResourcesListing;
