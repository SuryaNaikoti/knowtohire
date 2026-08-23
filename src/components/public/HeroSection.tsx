import React, { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Search, MapPin, Briefcase, BookOpen } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('Bengaluru, KA');

  const discoveryTabs = [
    { id: 'jobs', label: 'Find Jobs & Careers', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'resources', label: 'Knowledge & Resources', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'jobs') {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set('q', keyword.trim());
      if (location && location !== 'Remote') params.set('location', location.split(',')[0]);
      window.location.href = `/jobs?${params.toString()}`;
    } else {
      window.location.href = `/knowledge?search=${encodeURIComponent(keyword.trim())}`;
    }
  };

  return (
    <section className="relative bg-[#0b1120] text-white py-10 sm:py-16 md:py-24 overflow-hidden border-b border-kth-slate-800/80">
      {/* Background Ambient Mesh Glow */}
      <div className="absolute -top-32 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-kth-primary-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-kth-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Live Intelligence Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-4 sm:mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-kth-accent-emerald pulse-dot-ring" />
          <span className="text-[11px] sm:text-xs font-semibold text-kth-slate-200 tracking-wide">
            Career Intelligence & Verified Sustainability Platform
          </span>
        </div>

        {/* Primary Headline */}
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-[1.15] max-w-4xl mx-auto text-balance">
          Know More. Hire Better. Grow Faster.
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-xs sm:text-base md:text-lg text-kth-slate-300 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-normal text-pretty px-2">
          The unified career ecosystem connecting candidates with top job opportunities, verified study material, and professional document templates in India.
        </p>

        {/* Dual Discovery Tabs Header */}
        <div className="mb-4 inline-block max-w-full overflow-x-auto">
          <Tabs
            items={discoveryTabs}
            activeId={activeTab}
            onChange={setActiveTab}
            variant="discovery"
          />
        </div>

        {/* Prominent Discovery Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto bg-white rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row gap-2 border border-kth-slate-200/90 text-left">
          <div className="flex-1 flex items-center px-3 py-2.5 sm:py-0 gap-2.5 bg-kth-slate-50/80 sm:bg-transparent rounded-xl sm:rounded-none border border-kth-slate-200 sm:border-0 sm:border-r">
            <Search className="w-4 h-4 text-kth-slate-400 shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={activeTab === 'jobs' ? "Job title, specialization, or enterprise..." : "Search e-books, research guides, or templates..."}
              className="w-full font-sans text-xs sm:text-sm text-kth-slate-900 placeholder:text-kth-slate-400 bg-transparent outline-none min-w-0"
            />
          </div>

          {activeTab === 'jobs' && (
            <div className="w-full sm:w-52 flex items-center px-2 py-1.5 sm:py-0 gap-1.5 bg-kth-slate-50/80 sm:bg-transparent rounded-xl sm:rounded-none border border-kth-slate-200 sm:border-0">
              <MapPin className="w-4 h-4 text-kth-slate-400 shrink-0 ml-1" />
              <Select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                options={[
                  { value: 'Bengaluru, KA', label: 'Bengaluru, KA' },
                  { value: 'Hyderabad, TS', label: 'Hyderabad, TS' },
                  { value: 'Mumbai, MH', label: 'Mumbai, MH' },
                  { value: 'Delhi NCR', label: 'Delhi NCR' },
                  { value: 'Remote', label: 'Remote Only' },
                ]}
                className="border-0 shadow-none bg-transparent hover:bg-kth-slate-100/80 px-2 py-1 text-xs font-bold text-kth-slate-800 w-full"
              />
            </div>
          )}

          <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto h-11 sm:h-10 px-6 shrink-0 font-bold text-xs sm:text-sm shadow-sm">
            {activeTab === 'jobs' ? 'Search Jobs' : 'Search Knowledge'}
          </Button>
        </form>

        {/* Trending Tags & Micro Value Props */}
        <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2 flex-wrap text-xs text-kth-slate-400">
          <span className="font-semibold text-kth-slate-300 text-[11px] sm:text-xs">Trending:</span>
          <a href="/jobs?q=Sustainability" className="px-2.5 py-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors no-underline text-[11px] sm:text-xs">Sustainability</a>
          <a href="/jobs?q=ESG" className="px-2.5 py-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors no-underline text-[11px] sm:text-xs">ESG Analyst</a>
          <a href="/knowledge?search=BRSR" className="px-2.5 py-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors no-underline text-[11px] sm:text-xs">BRSR Guide</a>
          <a href="/templates?search=Resume" className="px-2.5 py-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors no-underline text-[11px] sm:text-xs">ATS Resume</a>
        </div>
      </div>
    </section>
  );
};

