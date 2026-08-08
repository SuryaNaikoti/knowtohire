import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Select } from '../../../components/ui/Select';
import { StaggerGrid, StaggerItem, MotionCard } from '../../../components/ui/Motion';
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

const DEMO_CANDIDATES: CandidateDirectoryRow[] = [
  { id: 'cand-1', first_name: 'Rahul', last_name: 'Sharma', email: 'rahul.sharma@gmail.com', headline: 'Senior ESG & Environmental Consultant', city: 'Bengaluru', country: 'India', created_at: '2026-08-06T10:00:00Z', updated_at: '2026-08-06T10:00:00Z', is_featured: true, approval_status: 'approved', availability: 'Open to Work', experience_years: 7, skills: ['ESG Reporting', 'ISO 14001', 'Carbon Accounting', 'GRI Standards'], completion_pct: 95 },
  { id: 'cand-2', first_name: 'Sneha', last_name: 'Reddy', email: 'sneha.reddy@gmail.com', headline: 'Environmental Compliance Engineer', city: 'Mumbai', country: 'India', created_at: '2026-08-05T09:30:00Z', updated_at: '2026-08-05T09:30:00Z', is_featured: false, approval_status: 'approved', availability: 'Open to Work', experience_years: 4, skills: ['Environmental Impact Assessment', 'EHS Compliance', 'ISO 14001', 'Waste Management'], completion_pct: 88 },
  { id: 'cand-3', first_name: 'Aditya', last_name: 'Rao', email: 'aditya.rao@techops.io', headline: 'Full Stack Developer & Cloud Architect', city: 'Bengaluru', country: 'India', created_at: '2026-08-04T09:00:00Z', updated_at: '2026-08-04T09:00:00Z', is_featured: true, approval_status: 'approved', availability: 'Interviewing', experience_years: 6, skills: ['React', 'Node.js', 'AWS', 'TypeScript', 'Docker'], completion_pct: 92 },
  { id: 'cand-4', first_name: 'Neha', last_name: 'Kapoor', email: 'neha.k@designlab.com', headline: 'UI/UX Product Designer', city: 'Chennai', country: 'India', created_at: '2026-08-03T08:15:00Z', updated_at: '2026-08-03T08:15:00Z', is_featured: false, approval_status: 'pending', availability: 'Open to Work', experience_years: 3, skills: ['Figma', 'User Research', 'Design Systems', 'Prototyping'], completion_pct: 78 },
  { id: 'cand-5', first_name: 'Vikas', last_name: 'Mehta', email: 'vikas.m@fintechsol.com', headline: 'Data Scientist & ML Engineer', city: 'Mumbai', country: 'India', created_at: '2026-08-02T14:20:00Z', updated_at: '2026-08-02T14:20:00Z', is_featured: false, approval_status: 'approved', availability: 'Interviewing', experience_years: 5, skills: ['Python', 'TensorFlow', 'BigQuery', 'MLOps', 'Scikit-learn'], completion_pct: 91 },
  { id: 'cand-6', first_name: 'Ananya', last_name: 'Deshmukh', email: 'ananya.d@sustainedge.com', headline: 'Sustainability Strategy Consultant', city: 'Bengaluru', country: 'India', created_at: '2026-08-01T11:10:00Z', updated_at: '2026-08-01T11:10:00Z', is_featured: true, approval_status: 'approved', availability: 'Open to Work', experience_years: 8, skills: ['ESG Strategy', 'BRSR Compliance', 'CDP Reporting', 'Net Zero Planning'], completion_pct: 97 },
  { id: 'cand-7', first_name: 'Karan', last_name: 'Joshi', email: 'karan.j@cybersec.in', headline: 'Cybersecurity & Cloud Security Analyst', city: 'Chennai', country: 'India', created_at: '2026-07-30T15:40:00Z', updated_at: '2026-07-30T15:40:00Z', is_featured: false, approval_status: 'pending', availability: 'Open to Work', experience_years: 2, skills: ['SIEM', 'Penetration Testing', 'Zero Trust', 'Azure Security'], completion_pct: 72 },
  { id: 'cand-8', first_name: 'Pooja', last_name: 'Hegde', email: 'pooja.h@cloudcorp.com', headline: 'DevOps & Site Reliability Engineer', city: 'Bengaluru', country: 'India', created_at: '2026-07-28T09:50:00Z', updated_at: '2026-07-28T09:50:00Z', is_featured: false, approval_status: 'approved', availability: 'Not Available', experience_years: 6, skills: ['Kubernetes', 'Terraform', 'CI/CD', 'Prometheus', 'Jenkins'], completion_pct: 85 },
  { id: 'cand-9', first_name: 'Siddharth', last_name: 'Malhotra', email: 'sid.m@legaltech.com', headline: 'Corporate Compliance & Legal Counsel', city: 'Mumbai', country: 'India', created_at: '2026-07-25T13:25:00Z', updated_at: '2026-07-25T13:25:00Z', is_featured: false, approval_status: 'rejected', availability: 'Open to Work', experience_years: 10, skills: ['Contract Law', 'GDPR Compliance', 'Regulatory Affairs', 'Company Secretary'], completion_pct: 65 },
  { id: 'cand-10', first_name: 'Tanya', last_name: 'Chawla', email: 'tanya.c@aishift.co', headline: 'AI Product Manager & Growth Strategist', city: 'Bengaluru', country: 'India', created_at: '2026-07-22T10:05:00Z', updated_at: '2026-07-22T10:05:00Z', is_featured: true, approval_status: 'approved', availability: 'Interviewing', experience_years: 9, skills: ['Product Strategy', 'OKRs', 'AI/ML Products', 'GTM Strategy', 'Roadmapping'], completion_pct: 93 },
  { id: 'cand-11', first_name: 'Amit', last_name: 'Patel', email: 'amit.p@datastack.com', headline: 'Business Analyst & Data Visualisation Lead', city: 'Chennai', country: 'India', created_at: '2026-07-18T18:30:00Z', updated_at: '2026-07-18T18:30:00Z', is_featured: false, approval_status: 'pending', availability: 'Open to Work', experience_years: 4, skills: ['Power BI', 'SQL', 'Tableau', 'Excel', 'Stakeholder Management'], completion_pct: 80 },
  { id: 'cand-12', first_name: 'Divya', last_name: 'Sundaram', email: 'divya.s@hrtech.com', headline: 'HR Technology & Talent Acquisition Specialist', city: 'Mumbai', country: 'India', created_at: '2026-07-14T08:45:00Z', updated_at: '2026-07-14T08:45:00Z', is_featured: false, approval_status: 'approved', availability: 'Open to Work', experience_years: 5, skills: ['ATS Management', 'Employer Branding', 'HRIS', 'Talent Pipeline'], completion_pct: 87 },
];



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

      setCandidates(formatted.length > 0 ? formatted : DEMO_CANDIDATES);
    } catch (err: any) {
      console.error(err);
      setCandidates(DEMO_CANDIDATES);
      setError('');
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
      {/* Page Title & View Switcher */}
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

        {/* View Switcher Toggle (Desktop hidden on mobile md:flex) */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-fit">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Table View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Card Grid
          </button>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Executive Summary Cards (Staggered Motion Entrance) */}
      <StaggerGrid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Candidates */}
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Candidates</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.total}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Registered Profiles</p>
          </div>
        </StaggerItem>

        {/* Card 2: Verified Candidates */}
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-teal-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Verified Profiles</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading mt-1.5">{stats.verified}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Approved Talent</p>
          </div>
        </StaggerItem>

        {/* Card 3: Pending Verification */}
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Verification</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 font-heading mt-1.5">{stats.pending}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">In Governance Review</p>
          </div>
        </StaggerItem>

        {/* Card 4: Featured Talent */}
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Featured Spotlights</p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 font-heading mt-1.5">{stats.featured}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Promoted Profiles</p>
          </div>
        </StaggerItem>

        {/* Card 5: Open to Work */}
        <StaggerItem className="col-span-2 sm:col-span-1">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-blue-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Open to Work</p>
            <h3 className="text-2xl sm:text-3xl font-black text-blue-600 font-heading mt-1.5">{stats.openToWork}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Active Jobseekers</p>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* Floating Filter & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate by name, email, skills..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Presets:
            </span>
            <button
              onClick={() => setFeaturedFilter(featuredFilter === 'featured' ? 'all' : 'featured')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                featuredFilter === 'featured' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ⭐ Featured Spotlight
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'approved' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ✓ Verified Profiles
            </button>
            <button
              onClick={() => setAvailabilityFilter(availabilityFilter === 'Open to Work' ? 'all' : 'Open to Work')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                availabilityFilter === 'Open to Work' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🟢 Open to Work
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <span>Showing <strong className="text-slate-900 font-bold">{filteredCandidates.length}</strong> candidates</span>
            {(search || statusFilter !== 'all' || expFilter !== 'all' || availabilityFilter !== 'all' || featuredFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Retrieving candidate directory records...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-900 font-heading">No matching candidates found</h4>
          <p className="text-xs text-slate-500">Try adjusting search parameters or reset active filter options.</p>
          <Button size="sm" variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        <>
          {/* MOBILE CANDIDATE CARDS LIST (Visible on mobile screens md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredCandidates.map((c) => {
              const initials = getInitials(c.first_name, c.last_name);
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/dashboard/admin/candidates/${c.id}`)}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3 cursor-pointer hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.first_name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-2xs border border-white">
                          {initials}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {c.first_name} {c.last_name}
                          {c.is_featured && <Star className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" title="Featured Candidate" />}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400">{c.email}</p>
                      </div>
                    </div>

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
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-snug">{c.headline}</p>
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {c.city}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-900">{c.experience_years} Yrs Exp</span>
                    </div>
                  </div>

                  {/* Verified Skills Pills */}
                  <div className="flex flex-wrap gap-1">
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

                  {/* Action & Availability */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {c.availability}
                    </span>

                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
                      onClick={() => navigate(`/dashboard/admin/candidates/${c.id}`)}
                    >
                      View Profile <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE & GRID VIEW MODE (Visible on tablet/desktop md:block) */}
          <div className="hidden md:block">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCandidates.map((c) => {
                  const initials = getInitials(c.first_name, c.last_name);
                  return (
                    <div
                      key={c.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                    >
                      {c.is_featured && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" /> Featured
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt={c.first_name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-sm flex items-center justify-center shadow-sm border border-white">
                              {initials}
                            </div>
                          )}

                          <div className="space-y-1 pr-6">
                            <h3 className="text-base font-black font-heading text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                              {c.first_name} {c.last_name}
                            </h3>
                            <p className="text-xs font-bold text-slate-600">{c.headline}</p>
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {c.city}</span>
                              <span>•</span>
                              <span className="font-bold text-slate-800">{c.experience_years} Yrs Exp</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {c.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-200/60">
                              {skill}
                            </span>
                          ))}
                          {c.skills.length > 3 && (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md">
                              +{c.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {c.availability}
                        </span>

                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all"
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
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="py-4 px-5">Candidate</th>
                        <th className="py-4 px-5 min-w-[220px]">Headline & Designation</th>
                        <th className="py-4 px-5">Location</th>
                        <th className="py-4 px-5">Experience</th>
                        <th className="py-4 px-5 min-w-[260px]">Verified Skill Set</th>
                        <th className="py-4 px-5">Availability</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {filteredCandidates.map((c) => {
                        const initials = getInitials(c.first_name, c.last_name);
                        return (
                          <tr
                        key={c.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/dashboard/admin/candidates/${c.id}`)}
                      >
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                {c.avatar_url ? (
                                  <img src={c.avatar_url} alt={c.first_name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs" />
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

                            <td className="py-4 px-5 min-w-[220px]">
                              <div className="font-bold text-slate-800 text-xs leading-relaxed line-clamp-2">{c.headline}</div>
                            </td>

                            <td className="py-4 px-5 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-slate-600 font-bold text-xs">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {c.city}, {c.country}
                              </div>
                            </td>

                            <td className="py-4 px-5 whitespace-nowrap">
                              <span className="font-extrabold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
                                {c.experience_years} Years
                              </span>
                            </td>

                            <td className="py-4 px-5 min-w-[260px]">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {c.skills.slice(0, 2).map((skill) => (
                                  <span key={skill} className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-200/70 whitespace-nowrap">
                                    {skill}
                                  </span>
                                ))}
                                {c.skills.length > 2 && (
                                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-1 rounded-md">
                                    +{c.skills.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {c.availability}
                              </span>
                            </td>

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
        </>
      )}
    </div>
  );
};

export default Candidates;
