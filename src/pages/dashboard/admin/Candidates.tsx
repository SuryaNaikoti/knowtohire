import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
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
  X,
  FileText
} from 'lucide-react';

interface CandidateProfileDetail {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  headline: string;
  city: string;
  country: string;
  created_at: string;
  is_featured?: boolean;
  approval_status?: 'pending' | 'approved' | 'rejected';
  skills: string[];
}

export const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfileDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfileDetail | null>(null);
  
  // Search/Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [internalNotes, setInternalNotes] = useState('');

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

      const formatted = (profs || []).map((p: any) => {
        const detail = candMap[p.id] || {};
        const localStatus = localStorage.getItem(`kth_cand_status_${p.id}`) as any;
        const isFeatured = localStorage.getItem(`kth_cand_featured_${p.id}`) === 'true';
        
        return {
          id: p.id,
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          email: p.email || '',
          headline: detail.headline || 'Environmental & Sustainability Specialist',
          city: detail.preferred_location || 'Bengaluru',
          country: 'India',
          created_at: p.created_at || new Date().toISOString(),
          is_featured: isFeatured,
          approval_status: localStatus || 'approved',
          skills: skillsMap[p.id] || ['Environmental Audit', 'EIA Compliance', 'ESG Strategy'],
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
        c.headline.toLowerCase().includes(lower)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(c => c.approval_status === statusFilter);
    }
    return result;
  }, [search, statusFilter, candidates]);

  const stats = useMemo(() => {
    const total = candidates.length;
    const approved = candidates.filter(c => c.approval_status === 'approved').length;
    const pending = candidates.filter(c => c.approval_status === 'pending').length;
    const featured = candidates.filter(c => c.is_featured).length;
    return { total, approved, pending, featured };
  }, [candidates]);

  const handleUpdateStatus = (candId: string, status: 'approved' | 'rejected') => {
    localStorage.setItem(`kth_cand_status_${candId}`, status);
    setCandidates(prev => prev.map(c => c.id === candId ? { ...c, approval_status: status } : c));
    if (selectedCandidate && selectedCandidate.id === candId) {
      setSelectedCandidate(prev => prev ? { ...prev, approval_status: status } : null);
    }
    setSuccess(`Candidate profile ${status} successfully.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleToggleFeatured = (candId: string, current: boolean) => {
    const nextVal = !current;
    localStorage.setItem(`kth_cand_featured_${candId}`, String(nextVal));
    setCandidates(prev => prev.map(c => c.id === candId ? { ...c, is_featured: nextVal } : c));
    if (selectedCandidate && selectedCandidate.id === candId) {
      setSelectedCandidate(prev => prev ? { ...prev, is_featured: nextVal } : null);
    }
    setSuccess(`Candidate featured status updated.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const saveNotes = () => {
    if (!selectedCandidate) return;
    localStorage.setItem(`kth_cand_notes_${selectedCandidate.id}`, internalNotes);
    setSuccess('Internal administration review notes saved.');
    setTimeout(() => setSuccess(''), 3000);
  };

  useEffect(() => {
    if (selectedCandidate) {
      const note = localStorage.getItem(`kth_cand_notes_${selectedCandidate.id}`);
      setInternalNotes(note || '');
    }
  }, [selectedCandidate]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '06 Aug 2026';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '06 Aug 2026';
    }
  };

  const getInitials = (fn: string, ln: string) => {
    return `${(fn || '')[0] || ''}${(ln || '')[0] || ''}`.toUpperCase() || 'CN';
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-600 shadow-2xs">
              <UserCheck className="w-6 h-6" />
            </div>
            Candidate Directory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Audit talent profiles, verify resumes, allocate featured badges, and manage availability states.
          </p>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between">
          <div>
            <p className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">Platform Talent</p>
            <h3 className="text-3xl font-black text-slate-900 font-heading mt-2">{stats.total}</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Registered Profiles</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-blue-500 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between">
          <div>
            <p className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">Approved Profiles</p>
            <h3 className="text-3xl font-black text-slate-900 font-heading mt-2">{stats.approved}</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Vetted Candidates</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between">
          <div>
            <p className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">Pending Verification</p>
            <h3 className="text-3xl font-black text-slate-900 font-heading mt-2">{stats.pending}</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Awaiting Review</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-purple-500 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between">
          <div>
            <p className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">Featured Spotlights</p>
            <h3 className="text-3xl font-black text-slate-900 font-heading mt-2">{stats.featured}</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Top Talent Board</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full pl-11 pr-4 bg-slate-50/90 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none h-10 transition-all"
            placeholder="Search candidates by name, email, credentials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none h-10 transition-all cursor-pointer"
        >
          <option value="all">All Approval States</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending Audit</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Candidates Table */}
        <div className={`${selectedCandidate ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center justify-between animate-pulse gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="w-32 h-4 bg-slate-100 rounded"></div>
                          <div className="w-48 h-3 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                      <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="p-16 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-heading">No candidates found</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Try adjusting your search criteria or approval filter.
                    </p>
                  </div>
                  <Button onClick={() => { setSearch(''); setStatusFilter('all'); }} variant="outline" size="sm" className="text-xs font-bold rounded-xl h-9 px-4">
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="py-4 px-5">Candidate</th>
                        <th className="py-4 px-5">Headline & Skills</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredCandidates.map((cand) => {
                        const name = `${cand.first_name} ${cand.last_name}`.trim() || 'Vetted Candidate';
                        const initials = getInitials(cand.first_name, cand.last_name);
                        const isSelected = selectedCandidate?.id === cand.id;

                        return (
                          <tr
                            key={cand.id}
                            onClick={() => setSelectedCandidate(cand)}
                            className={`hover:bg-slate-50/90 transition-colors duration-150 cursor-pointer ${isSelected ? 'bg-emerald-50/40' : ''}`}
                          >
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 border-2 border-white shadow-2xs flex items-center justify-center font-black text-xs shrink-0">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-slate-900 text-sm leading-snug truncate">{name}</p>
                                    {cand.is_featured && <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                                  </div>
                                  <p className="text-xs text-slate-400 font-medium truncate">{cand.email}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              <p className="font-semibold text-slate-800 leading-snug line-clamp-1">{cand.headline}</p>
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {cand.skills.slice(0, 2).map((s, idx) => (
                                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              {cand.approval_status === 'approved' ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/90 px-2.5 py-1 rounded-full border border-emerald-200/70">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approved
                                </span>
                              ) : cand.approval_status === 'rejected' ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50/90 px-2.5 py-1 rounded-full border border-rose-200/70">
                                  <XCircle className="w-3.5 h-3.5 text-rose-500" /> Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50/90 px-2.5 py-1 rounded-full border border-amber-200/70">
                                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-5 text-right">
                              <Button size="sm" variant="outline" className="text-xs font-bold h-8 px-3 rounded-xl bg-white border-slate-200">
                                Audit <ChevronRight className="w-3.5 h-3.5 ml-1" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Candidate Detail Audit Side-Panel */}
        {selectedCandidate && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-lg p-6 space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Candidate Verification Audit
              </h3>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">
                {selectedCandidate.first_name} {selectedCandidate.last_name}
              </h4>
              <p className="text-xs font-medium text-slate-500">{selectedCandidate.headline}</p>
              <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedCandidate.city}, {selectedCandidate.country}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Moderation Controls</p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleUpdateStatus(selectedCandidate.id, 'approved')}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-4 rounded-xl flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Profile
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedCandidate.id, 'rejected')}
                  size="sm"
                  variant="outline"
                  className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 text-xs font-bold h-9 px-4 rounded-xl flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> Reject Profile
                </Button>
              </div>

              <Button
                onClick={() => handleToggleFeatured(selectedCandidate.id, !!selectedCandidate.is_featured)}
                size="sm"
                variant="outline"
                className="w-full bg-amber-50/80 text-amber-800 border-amber-200 hover:bg-amber-100 text-xs font-bold h-9 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
                {selectedCandidate.is_featured ? 'Remove Featured Spotlight' : 'Promote to Featured Spotlight'}
              </Button>
            </div>

            {/* Audit Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700">Internal Audit Notes</label>
              <textarea
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white placeholder-slate-400 min-h-[80px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Log internal compliance checks or verification notes..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
              <Button onClick={saveNotes} size="sm" variant="outline" className="w-full text-xs font-bold rounded-xl h-8 bg-white border-slate-200">
                Save Audit Log
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;
