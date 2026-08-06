import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { UserCheck, Sparkles, MapPin, CheckCircle2, XCircle, ChevronRight, X, AlertTriangle } from 'lucide-react';

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
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateProfileDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfileDetail | null>(null);
  
  // Search/Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Step 1: Fetch candidate profiles from profiles table
      const { data: profs, error: err } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, created_at, avatar_url')
        .eq('role', 'candidate');

      if (err) throw err;

      // Step 2: Fetch detailed candidate profile metadata
      const candMap: Record<string, any> = {};
      try {
        const { data: cDetails } = await supabase
          .from('candidate_profiles')
          .select('id, headline, bio, experience_years, preferred_location');
        if (cDetails) {
          for (const c of cDetails) {
            candMap[c.id] = c;
          }
        }
      } catch (e) {
        console.warn('candidate_profiles optional fetch info:', e);
      }

      // Step 3: Fetch candidate skills if available
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
      setFilteredCandidates(formatted);
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

  useEffect(() => {
    let result = candidates;
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(c => 
        c.first_name.toLowerCase().includes(lower) ||
        c.last_name.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower) ||
        c.headline.toLowerCase().includes(lower)
      );
    }
    if (statusFilter) {
      result = result.filter(c => c.approval_status === statusFilter);
    }
    setFilteredCandidates(result);
  }, [search, statusFilter, candidates]);

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

  if (loading) return <Loading label="Retrieving candidate intelligence database..." />;

  const tableHeaders = [
    { key: 'details', label: 'Candidate details' },
    { key: 'headline', label: 'Professional Profile' },
    { key: 'status', label: 'Approval Stage' },
    { key: 'actions', label: 'Action', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" /> Candidate Directory Management
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Audit talent profiles, verify resumes, allocate featured badges, and manage availability states.
          </p>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Controls toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-gray-900 bg-white placeholder-gray-400 border-solid outline-none"
            placeholder="Search candidates by name, email, credentials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Candidates Grid */}
        <div className={`${selectedCandidate ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {filteredCandidates.length === 0 ? (
            <div className="bg-white border border-gray-155 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
              <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No candidates match your queries.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 border-solid rounded-2xl overflow-hidden">
              <Table headers={tableHeaders}>
                {filteredCandidates.map((c) => {
                  const name = `${c.first_name} ${c.last_name}`.trim() || 'Vetted Candidate';
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-bold text-gray-900 text-xs sm:text-sm">{name}</div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{c.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-600 font-semibold truncate max-w-xs">{c.headline}</div>
                        <div className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-350" /> {c.city}, {c.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={
                              c.approval_status === 'approved'
                                ? 'secondary'
                                : c.approval_status === 'rejected'
                                ? 'danger'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {c.approval_status || 'approved'}
                          </Badge>
                          {c.is_featured && (
                            <Badge variant="primary" size="sm" className="bg-amber-50 text-amber-800 border-amber-250">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="bg-white text-[10px] font-bold" onClick={() => setSelectedCandidate(c)}>
                          Manage <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            </div>
          )}
        </div>

        {/* Right Side: Profile Vetting Workspace Panel */}
        {selectedCandidate && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-start border-b border-solid border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900 leading-tight">
                  {selectedCandidate.first_name} {selectedCandidate.last_name}
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1">{selectedCandidate.headline}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-655 transition cursor-pointer" onClick={() => setSelectedCandidate(null)}>
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Candidate Skills</h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedCandidate.skills.length > 0 ? (
                    selectedCandidate.skills.map((skill) => (
                      <span key={skill} className="bg-blue-50 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">No verified credentials declared.</span>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Administrative Review Notes</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary text-xs font-semibold text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[90px] outline-none"
                  placeholder="Add private review comments, background audit info..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
                <Button size="sm" onClick={saveNotes} className="text-[10px] font-bold">
                  Save Internal Notes
                </Button>
              </div>
            </div>

            {/* Workflow Actions */}
            <div className="border-t border-solid border-gray-100 pt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold bg-white text-emerald-700 border-emerald-250 hover:bg-emerald-50"
                  onClick={() => handleUpdateStatus(selectedCandidate.id, 'approved')}
                  disabled={selectedCandidate.approval_status === 'approved'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold bg-white text-red-700 border-red-200 hover:bg-red-50"
                  onClick={() => handleUpdateStatus(selectedCandidate.id, 'rejected')}
                  disabled={selectedCandidate.approval_status === 'rejected'}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject Profile
                </Button>
              </div>

              <Button
                size="sm"
                variant={selectedCandidate.is_featured ? 'outline' : 'primary'}
                className="w-full text-xs font-bold flex items-center justify-center gap-1.5"
                onClick={() => handleToggleFeatured(selectedCandidate.id, !!selectedCandidate.is_featured)}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                {selectedCandidate.is_featured ? 'Remove Featured Badge' : 'Allocate Featured Badge'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;
