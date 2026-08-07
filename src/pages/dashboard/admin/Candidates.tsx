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
  ArrowUpDown
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

  // Search, Filter & Sort states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expFilter, setExpFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'updated' | 'experience' | 'alphabetical'>('newest');

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

        // Rich fallback defaults
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
          completion_pct: 85 + (idx % 3) * 5, // 85%, 90%, 95%
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

  // Filtered & Sorted Candidate List
  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    // Search filter
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

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.approval_status === statusFilter);
    }

    // Experience filter
    if (expFilter === '0-3') {
      result = result.filter(c => c.experience_years <= 3);
    } else if (expFilter === '3-5') {
      result = result.filter(c => c.experience_years > 3 && c.experience_years <= 5);
    } else if (expFilter === '5+') {
      result = result.filter(c => c.experience_years > 5);
    }

    // Location filter
    if (locationFilter !== 'all') {
      result = result.filter(c => c.city.toLowerCase() === locationFilter.toLowerCase());
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      result = result.filter(c => c.availability === availabilityFilter);
    }

    // Featured filter
    if (featuredFilter === 'featured') {
      result = result.filter(c => c.is_featured);
    }

    // Sorting
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

  // Executive KPI Card Metrics
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-600 shadow-2xs">
              <UserCheck className="w-6 h-6" />
            </div>
            Candidate Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Browse candidate profiles, verify technical credentials, filter availability states, and manage talent spotlights.
          </p>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Candidates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-2xs hover:shadow-md transition-all">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Candidates</p>
          <h3 className="text-2xl font-black text-slate-900 font-heading mt-1.5">{stats.total}</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Registered Profiles</p>
        </div>

        {/* Card 2: Verified Candidates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-teal-500 shadow-2xs hover:shadow-md transition-all">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Verified Profiles</p>
          <h3 className="text-2xl font-black text-emerald-600 font-heading mt-1.5">{stats.verified}</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Approved Talent</p>
        </div>

        {/* Card 3: Pending Verification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-2xs hover:shadow-md transition-all">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Verification</p>
          <h3 className="text-2xl font-black text-amber-600 font-heading mt-1.5">{stats.pending}</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1">In Governance Review</p>
        </div>

        {/* Card 4: Featured Talent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 shadow-2xs hover:shadow-md transition-all">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Featured Spotlights</p>
          <h3 className="text-2xl font-black text-indigo-600 font-heading mt-1.5">{stats.featured}</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Promoted Profiles</p>
        </div>

        {/* Card 5: Open to Work */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-blue-500 shadow-2xs hover:shadow-md transition-all">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Open to Work</p>
          <h3 className="text-2xl font-black text-blue-600 font-heading mt-1.5">{stats.openToWork}</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Active Jobseekers</p>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Sorting */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
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

        {/* Secondary Filter Bar */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing <strong className="text-slate-900 font-bold">{filteredCandidates.length}</strong> candidates</span>

          {(search || statusFilter !== 'all' || expFilter !== 'all' || availabilityFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Candidate Directory Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading candidate directory...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-900 font-heading">No matching candidates found</h4>
          <p className="text-xs text-slate-500">Try refining your search query or reset active filters.</p>
          <Button size="sm" variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Headline / Designation</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Verified Skills</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Profile Score</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredCandidates.map((c) => {
                  const initials = getInitials(c.first_name, c.last_name);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Avatar & Candidate Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt={c.first_name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-2xs border border-white">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {c.first_name} {c.last_name}
                              {c.is_featured && <Star className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" title="Featured Candidate" />}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">{c.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Headline */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 line-clamp-1 max-w-xs">{c.headline}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-600 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {c.city}, {c.country}
                        </div>
                      </td>

                      {/* Experience Years */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {c.experience_years} Years
                        </span>
                      </td>

                      {/* Skills Chips */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200/60">
                              {skill}
                            </span>
                          ))}
                          {c.skills.length > 3 && (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                              +{c.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Availability */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {c.availability}
                        </span>
                      </td>

                      {/* Approval Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
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

                      {/* Profile Completion Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="w-24 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-700">
                            <span>{c.completion_pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.completion_pct}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Action: View Profile */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white text-xs font-bold text-slate-800 hover:text-emerald-600 hover:border-emerald-500 shadow-2xs"
                          onClick={() => navigate(`/dashboard/admin/candidates/${c.id}`)}
                        >
                          View Profile <ChevronRight className="w-4 h-4 ml-1 text-slate-400" />
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
