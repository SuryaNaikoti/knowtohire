import React, { useState, useEffect } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { candidateDiscoveryService, DiscoverableCandidate } from '@/services/candidateDiscoveryService';
import { Loader2, Users } from 'lucide-react';

export const EmployerCandidateComparePage: React.FC = () => {
  const [candidates, setCandidates] = useState<DiscoverableCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    candidateDiscoveryService.searchCandidates({ limit: 4 }).then((res) => {
      if (!isMounted) return;
      if (res.data) {
        setCandidates(res.data.slice(0, 3));
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <EmployerShell title="Side-by-Side Candidate Comparison Workspace" currentPath="/employer/candidates">
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex justify-between items-center text-xs">
          <span className="text-kth-slate-500">
            Comparing <strong className="text-kth-slate-900">{candidates.length} Candidates</strong> from Live Talent Pool
          </span>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = '/employer/candidates')}>
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
            <Button variant="primary" size="sm" onClick={() => (window.location.href = '/employer/candidates')}>
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
                </div>

                {/* Candidate Columns */}
                {candidates.map((cand) => (
                  <div key={cand.id} className="p-6 space-y-8 text-xs text-kth-slate-800">
                    <div className="h-16 flex flex-col justify-center">
                      <strong className="font-bold text-sm text-kth-slate-900 block">{cand.name}</strong>
                      <span className="text-kth-slate-500 text-[11px] font-medium line-clamp-1">{cand.headline}</span>
                    </div>
                    <div className="py-2">
                      <Badge variant="emerald" className="font-mono text-xs">
                        {cand.profileCompletion}%
                      </Badge>
                    </div>
                    <div className="py-2 font-semibold">{cand.experienceYears}+ Years</div>
                    <div className="py-2 text-kth-primary-700 font-semibold">{cand.domain}</div>
                    <div className="py-2 text-kth-slate-600">{cand.location}</div>
                    <div className="py-2 text-kth-slate-600 text-[11px] leading-tight">
                      {cand.educationSummary || 'Graduate Degree'}
                    </div>
                    <div className="py-2 font-mono font-bold text-kth-primary-600">
                      ₹{(cand.expectedSalaryINR / 100000).toFixed(1)}L/yr
                    </div>
                    <div className="py-2">{cand.noticePeriodDays} Days</div>
                    <div className="py-2 flex gap-1 flex-wrap">
                      {cand.skills.slice(0, 3).map((s, idx) => (
                        <Badge key={idx} variant="slate" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Stacked Comparison Cards */}
            <div className="space-y-4 md:hidden">
              {candidates.map((cand) => (
                <Card key={cand.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-kth-slate-900">{cand.name}</h4>
                      <span className="text-xs text-kth-slate-500">{cand.headline}</span>
                    </div>
                    <Badge variant="emerald" className="font-mono">
                      {cand.profileCompletion}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-kth-slate-400 block text-[10px]">EXPERIENCE:</span>{' '}
                      {cand.experienceYears}+ yrs
                    </div>
                    <div>
                      <span className="text-kth-slate-400 block text-[10px]">SALARY:</span> ₹
                      {(cand.expectedSalaryINR / 100000).toFixed(1)}L
                    </div>
                    <div>
                      <span className="text-kth-slate-400 block text-[10px]">LOCATION:</span> {cand.location}
                    </div>
                    <div>
                      <span className="text-kth-slate-400 block text-[10px]">NOTICE:</span> {cand.noticePeriodDays}{' '}
                      Days
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </EmployerShell>
  );
};
