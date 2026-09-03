import React, { useState, useEffect } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { candidateDiscoveryService, DiscoverableCandidate } from '@/services/candidateDiscoveryService';
import { navigateTo } from '@/utils/navigation';
import { Loader2, Users, ArrowRight, X } from 'lucide-react';

export const EmployerCandidateComparePage: React.FC = () => {
  const [candidates, setCandidates] = useState<DiscoverableCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleRemove = (idToRemove: string) => {
    setCandidates((prev) => {
      const next = prev.filter((c) => c.id !== idToRemove);
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.setItem('kth_compare_candidate_ids', JSON.stringify(next.map((c) => c.id)));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;
    const loadComparisonCandidates = async () => {
      setIsLoading(true);
      let targetIds: string[] = [];
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          const raw = window.sessionStorage.getItem('kth_compare_candidate_ids');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              targetIds = parsed;
            }
          }
        } catch {
          // ignore
        }
      }

      if (targetIds.length > 0) {
        // Fetch canonical profiles for each selected candidate
        const fetchedList: DiscoverableCandidate[] = [];
        for (const cid of targetIds) {
          const res = await candidateDiscoveryService.getCandidateById(cid);
          if (res.data && !fetchedList.some((c) => c.id === res.data!.id)) {
            fetchedList.push(res.data);
          }
        }
        if (isMounted) {
          setCandidates(fetchedList);
          setIsLoading(false);
        }
      } else {
        // Fallback to top discoverable candidates
        const res = await candidateDiscoveryService.searchCandidates({ limit: 4 });
        if (isMounted) {
          if (res.data) {
            setCandidates(res.data.slice(0, 3));
          }
          setIsLoading(false);
        }
      }
    };

    loadComparisonCandidates();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <EmployerShell title="Side-by-Side Candidate Comparison Workspace" currentPath="/employer/candidates">
      <div className="space-y-6 font-sans text-left w-full min-w-0">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs w-full min-w-0">
          <span className="text-kth-slate-500">
            Comparing <strong className="text-kth-slate-900 font-semibold">{candidates.length} Candidates</strong> from Live Talent Pool
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('/employer/candidates')}
            className="w-full sm:w-auto justify-center"
          >
            + Select Other Candidates
          </Button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500">Loading candidate matrix comparison...</p>
          </div>
        ) : candidates.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-10 h-10 text-kth-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-kth-slate-900">No Candidates to Compare</h4>
            <p className="text-xs text-kth-slate-500 mb-4">Select candidates from the discovery page to view side-by-side.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('/employer/candidates')}
            >
              Browse Candidates
            </Button>
          </Card>
        ) : (
          <>
            {/* Desktop Side-by-Side Comparison Matrix */}
            <div className="bg-white rounded-2xl border border-kth-slate-200 shadow-xs overflow-hidden hidden md:block">
              <div
                className="grid divide-x divide-kth-slate-200"
                style={{ gridTemplateColumns: `200px repeat(${candidates.length}, minmax(0, 1fr))` }}
              >
                {/* Header Column */}
                <div className="p-6 bg-kth-slate-50/50 space-y-8 font-bold text-xs text-kth-slate-500 uppercase tracking-wider">
                  <div className="h-16 flex items-center">CANDIDATE</div>
                  <div className="py-2">PROFILE COMPLETION</div>
                  <div className="py-2">EXPERIENCE</div>
                  <div className="py-2">DOMAIN / SPECIALTY</div>
                  <div className="py-2">LOCATION</div>
                  <div className="py-2">EDUCATION</div>
                  <div className="py-2">SALARY EXPECTATION</div>
                  <div className="py-2">NOTICE PERIOD</div>
                  <div className="py-2">TOP SKILLS</div>
                  <div className="py-2">ACTION</div>
                </div>

                {/* Candidate Columns */}
                {candidates.map((cand) => (
                  <div key={cand.id} className="p-6 space-y-8 text-xs text-kth-slate-800 relative group">
                    <div className="h-16 flex flex-col justify-center relative">
                      <div className="flex justify-between items-start">
                        <div className="pr-4">
                          <strong
                            onClick={() => navigateTo(`/employer/candidates/${cand.id}`)}
                            className="font-bold text-sm text-kth-slate-900 hover:text-kth-primary-600 cursor-pointer block truncate"
                          >
                            {cand.name}
                          </strong>
                          <span className="text-[11px] text-kth-slate-400 block truncate">{cand.headline}</span>
                        </div>
                        <button
                          onClick={() => handleRemove(cand.id)}
                          className="text-kth-slate-400 hover:text-rose-600 p-1 transition"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="py-2">
                      <Badge variant="emerald" className="font-mono">
                        {cand.profileCompletion}% Match
                      </Badge>
                    </div>

                    <div className="py-2 font-medium">{cand.experienceYears}+ Years</div>

                    <div className="py-2 font-semibold text-kth-primary-700 truncate" title={cand.domain}>
                      {cand.domain}
                    </div>

                    <div className="py-2 truncate" title={cand.location}>
                      {cand.location}
                    </div>

                    <div className="py-2 truncate" title={cand.educationSummary}>
                      {cand.educationSummary}
                    </div>

                    <div className="py-2 font-mono font-bold text-kth-slate-900">
                      ₹{(cand.expectedSalaryINR / 100000).toFixed(1)} Lakhs
                    </div>

                    <div className="py-2">{cand.noticePeriodDays} Days Notice</div>

                    <div className="py-2 flex gap-1 flex-wrap">
                      {cand.skills.slice(0, 3).map((s, idx) => (
                        <Badge key={idx} variant="indigo" className="text-[10px] py-0">
                          {s}
                        </Badge>
                      ))}
                    </div>

                    <div className="py-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigateTo(`/employer/candidates/${cand.id}`)}
                        className="w-full text-xs font-semibold"
                      >
                        Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Stacked Comparison Cards */}
            <div className="space-y-4 md:hidden w-full min-w-0">
              {candidates.map((cand) => (
                <Card key={cand.id} className="p-4 space-y-3 w-full min-w-0">
                  <div className="flex justify-between items-start border-b pb-2 gap-2">
                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => navigateTo(`/employer/candidates/${cand.id}`)}
                        className="font-bold text-sm text-kth-slate-900 hover:text-kth-primary-600 cursor-pointer hover:underline truncate"
                      >
                        {cand.name}
                      </h4>
                      <span className="text-xs text-kth-slate-500 block truncate">{cand.headline}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="emerald" className="font-mono text-[10px]">
                        {cand.profileCompletion}%
                      </Badge>
                      <button
                        onClick={() => handleRemove(cand.id)}
                        className="text-kth-slate-400 hover:text-rose-600 p-1 transition"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-kth-slate-50 p-2 rounded-lg">
                      <span className="text-kth-slate-400 block text-[10px] font-bold">EXPERIENCE:</span>{' '}
                      <span className="font-semibold text-kth-slate-800">{cand.experienceYears}+ yrs</span>
                    </div>
                    <div className="bg-kth-slate-50 p-2 rounded-lg">
                      <span className="text-kth-slate-400 block text-[10px] font-bold">SALARY:</span>{' '}
                      <span className="font-semibold text-kth-slate-800">₹{(cand.expectedSalaryINR / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="bg-kth-slate-50 p-2 rounded-lg">
                      <span className="text-kth-slate-400 block text-[10px] font-bold">LOCATION:</span>{' '}
                      <span className="font-semibold text-kth-slate-800 truncate block">{cand.location}</span>
                    </div>
                    <div className="bg-kth-slate-50 p-2 rounded-lg">
                      <span className="text-kth-slate-400 block text-[10px] font-bold">NOTICE:</span>{' '}
                      <span className="font-semibold text-kth-slate-800">{cand.noticePeriodDays} Days</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigateTo(`/employer/candidates/${cand.id}`)}
                    className="w-full justify-center text-xs mt-2"
                  >
                    View Full Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </EmployerShell>
  );
};
