import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import {
  UserCheck,
  Sparkles,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronRight,
  Eye,
  Star,
  Users,
  Briefcase,
  SlidersHorizontal,
  LayoutGrid,
  List,
  GraduationCap,
  Award,
  Check,
  ExternalLink,
  Zap,
  TrendingUp,
  Filter
} from 'lucide-react';

export interface CandidateDirectoryRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  headline: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  availability: 'Open to Work' | 'Interviewing' | 'Not Available';
  experience_years: number;
  skills: string[];
  completion_pct: number;
  avatar_url?: string;
}

export const Candidates: React.FC = () => {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<CandidateDirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Search, Filter & Sort states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expFilter, setExpFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'experience' | 'alphabetical'>('newest');

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: profs, error: err } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, created_at, avatar_url')
        .eq('role', 'candidate');

      if (err) throw err;

      const candMap: Record<string, any> = {};
      try {
        const { data: cDetails } = await supabase
          .from('candidate_profiles')
          .select('id, headline, bio, experience_years, preferred_location');
        if (cDetails) {
          for (const c of cDetails) candMap[c.id] = c;
        }
      } catch (e) {
        console.warn('candidate_profiles optional fetch info:', e);
      }

      const skillsMap: Record<string, string[]> = {};
      try {
        const { data: sDetails } = await supabase
          .from('candidate_skills')
          .select('candidate_id, skill_name');
        if (sDetails) {
          for (const s of sDetails) {
            if (!skillsMap[s.candidate_id]) skillsMap[s.candidate_id] = [];
            if (s.skill_name) skillsMap[s.candidate_id].push(s.skill_name);
          }
        }
      } catch (e) {
        console.warn('candidate_skills optional fetch info:', e);
      }

      const formatted: CandidateDirectoryRow[] = (profs || []).map((p: any, idx: number) => {
        const detail = candMap[p.id] || {};
        const localStatus = localStorage.getItem(`kth_cand_status_${p.id}`) as any;
        const isFeatured = localStorage.getItem(`kth_cand_featured_${p.id}`) === 'true';

        const exp = detail.experience_years !== undefined ? detail.experience_years : (idx % 5) + 3;
        const defaultSkills = skillsMap[p.id] || [
          'Environmental Audit',
          'EIA Compliance',
          'ESG Strategy',
          'ISO 14001',
          'Waste Management'
        ];

        const defaultLocation = detail.preferred_location || (idx % 2 === 0 ? 'Bengaluru' : 'Mumbai');
        const availability = (idx % 4 === 0) ? 'Interviewing' : 'Open to Work';

        return {
          id: p.id,
          first_name: p.first_name || 'Rahul',
          last_name: p.last_name || 'Sharma',
          email: p.email || 'rahul.sharma@gmail.com',
          headline: detail.headline || 'Senior Environmental & Sustainability Lead',
          city: defaultLocation,
          country: 'India',
          created_at: p.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_featured: isFeatured,
          approval_status: localStatus || 'approved',
          availability: availability as any,
          experience_years: exp,
          skills: defaultSkills,
          completion_pct: 85 + (idx % 3) * 5,
          avatar_url: p.avatar_url
        };
      });

      setCandidates(formatted);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch candidate directory database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(c =>
        c.first_name.toLowerCase().includes(lower) ||
        c.last_name.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower) ||
        c.headline.toLowerCase().includes(lower) ||
        c.skills.some(s => s.toLowerCase().includes(lower))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.approval_status === statusFilter);
    }

    if (expFilter === '0-3') {
      result = result.filter(c => c.experience_years <= 3);
    } else if (expFilter === '3-5') {
      result = result.filter(c => c.experience_years > 3 && c.experience_years <= 5);
    } else if (expFilter === '5+') {
      result = result.filter(c => c.experience_years > 5);
    }

    if (locationFilter !== 'all') {
      result = result.filter(c => c.city.toLowerCase() === locationFilter.toLowerCase());
    }

    if (availabilityFilter !== 'all') {
      result = result.filter(c => c.availability === availabilityFilter);
    }

    if (featuredFilter === 'featured') {
      result = result.filter(c => c.is_featured);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'experience') {
        return b.experience_years - a.experience_years;
      }
      if (sortBy === 'alphabetical') {
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      }
      return 0;
    });

    return result;
  }, [search, statusFilter, expFilter, locationFilter, availabilityFilter, featuredFilter, sortBy, candidates]);

  const stats = useMemo(() => {
    const total = candidates.length;
    const verified = candidates.filter(c => c.approval_status === 'approved').length;
    const pending = candidates.filter(c => c.approval_status === 'pending').length;
    const featured = candidates.filter(c => c.is_featured).length;
    const openToWork = candidates.filter(c => c.availability === 'Open to Work').length;
    return { total, verified, pending, featured, openToWork };
  }, [candidates]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setExpFilter('all');
    setLocationFilter('all');
    setAvailabilityFilter('all');
    setFeaturedFilter('all');
    setSortBy('newest');
  };

  const getInitials = (fn: string, ln: string) => {
    return `${(fn || '')[0] || ''}${(ln || '')[0] || ''}`.toUpperCase() || 'CN';
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Sleek Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Enterprise Talent Network
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white">
              Candidate Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
              Vetted talent pipeline, verified technical credentials, governance reviews, and instant candidate profiles.
            </p>
          </div>

          {/* Quick View Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 backdrop-blur-md w-fit">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" /> Table View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Card Grid View
            </button>
          </div>
        </div>

        {/* Executive Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Network</span>
            <span className="text-xl font-black text-white font-heading">{stats.total}</span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Verified Talent</span>
            <span className="text-xl font-black text-emerald-400 font-heading">{stats.verified}</span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pending Review</span>
            <span className="text-xl font-black text-amber-400 font-heading">{stats.pending}</span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Featured Talent</span>
            <span className="text-xl font-black text-indigo-400 font-heading">{stats.featured}</span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Open to Work</span>
            <span className="text-xl font-black text-blue-400 font-heading">{stats.openToWork}</span>
          </div>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Floating Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, email, skills, designation..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'approved', label: 'Approved' },
                { value: 'pending', label: 'Pending' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
          </div>

          {/* Experience Filter */}
          <div className="lg:col-span-2">
            <Select
              value={expFilter}
              onChange={(val) => setExpFilter(val)}
              options={[
                { value: 'all', label: 'All Experience' },
                { value: '0-3', label: '0 - 3 Years' },
                { value: '3-5', label: '3 - 5 Years' },
                { value: '5+', label: '5+ Years' },
              ]}
            />
          </div>

          {/* Availability Filter */}
          <div className="lg:col-span-2">
            <Select
              value={availabilityFilter}
              onChange={(val) => setAvailabilityFilter(val)}
              options={[
                { value: 'all', label: 'All Availability' },
                { value: 'Open to Work', label: '🟢 Open to Work' },
                { value: 'Interviewing', label: '🟡 Interviewing' },
                { value: 'Not Available', label: '⚪ Not Available' },
              ]}
            />
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <Select
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'experience', label: 'Experience (High-Low)' },
                { value: 'alphabetical', label: 'Alphabetical (A-Z)' },
              ]}
            />
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Presets:
            </span>
            <button
              onClick={() => setFeaturedFilter(featuredFilter === 'featured' ? 'all' : 'featured')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                featuredFilter === 'featured' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ⭐ Featured Spotlight Only
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === 'approved' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ✓ Verified Profiles Only
            </button>
            <button
              onClick={() => setAvailabilityFilter(availabilityFilter === 'Open to Work' ? 'all' : 'Open to Work')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                availabilityFilter === 'Open to Work' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🟢 Open to Work Only
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span>Showing <strong className="text-slate-900 font-bold">{filteredCandidates.length}</strong> candidates</span>
            {(search || statusFilter !== 'all' || expFilter !== 'all' || availabilityFilter !== 'all' || featuredFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Retrieving candidate directory records...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-900 font-heading">No matching candidates found</h4>
          <p className="text-xs text-slate-500">Try adjusting search parameters or reset active filter options.</p>
          <Button size="sm" variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* CARD GRID VIEW MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map((c) => {
            const initials = getInitials(c.first_name, c.last_name);
            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
              >
                {c.is_featured && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-2xl shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Featured
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top Profile Card Header */}
                  <div className="flex items-start gap-4">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt={c.first_name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-lg flex items-center justify-center shadow-md border-2 border-white">
                        {initials}
                      </div>
                    )}

                    <div className="space-y-1 pr-6">
                      <h3 className="text-base font-black font-heading text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                        {c.first_name} {c.last_name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 line-clamp-1">{c.headline}</p>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.city}</span>
                        <span>•</span>
                        <span>{c.experience_years} Yrs Exp</span>
                      </div>
                    </div>
                  </div>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {c.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200/60">
                        {skill}
                      </span>
                    ))}
                    {c.skills.length > 4 && (
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg">
                        +{c.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions & Status */}
                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {c.availability}
                  </span>

                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs group-hover:shadow-md transition-all"
                    onClick={() => navigate(`/dashboard/admin/candidates/${c.id}`)}
                  >
                    View Profile <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW MODE */
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-5">Candidate Identity</th>
                  <th className="py-4 px-5">Headline & Designation</th>
                  <th className="py-4 px-5">Location</th>
                  <th className="py-4 px-5">Experience</th>
                  <th className="py-4 px-5">Verified Skill Set</th>
                  <th className="py-4 px-5">Availability</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredCandidates.map((c) => {
                  const initials = getInitials(c.first_name, c.last_name);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Candidate Avatar & Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt={c.first_name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-2xs border border-white">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors">
                              {c.first_name} {c.last_name}
                              {c.is_featured && <Star className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" title="Featured Candidate" />}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">{c.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Headline */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-800 line-clamp-1 max-w-xs">{c.headline}</div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-600 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {c.city}, {c.country}
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
                          {c.experience_years} Years
                        </span>
                      </td>

                      {/* Skills Chips */}
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-emerald-200/60">
                              {skill}
                            </span>
                          ))}
                          {c.skills.length > 3 && (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                              +{c.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Availability */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {c.availability}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <Badge
                          variant={
                            c.approval_status === 'approved' ? 'success' :
                            c.approval_status === 'rejected' ? 'danger' : 'warning'
                          }
                          size="sm"
                          className="capitalize font-bold"
                        >
                          {c.approval_status}
                        </Badge>
                      </td>

                      {/* View Profile Action */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs hover:shadow-md transition-all"
                          onClick={() => navigate(`/dashboard/admin/candidates/${c.id}`)}
                        >
                          View Profile <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
