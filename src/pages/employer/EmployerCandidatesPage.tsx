import React, { useState, useEffect } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { candidateDiscoveryService, DiscoverableCandidate } from '@/services/candidateDiscoveryService';
import { taxonomyService, CareerCategory } from '@/services';
import { Search, MapPin, ArrowRight, GitCompare, Loader2, Users } from 'lucide-react';

export const EmployerCandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<DiscoverableCandidate[]>([]);
  const [categories, setCategories] = useState<CareerCategory[]>([]);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [sortBy, setSortBy] = useState<'completion' | 'experience_high' | 'experience_low' | 'salary_low' | 'salary_high' | 'notice_fast'>('completion');
  const [minExp, setMinExp] = useState<string>('all');
  const [maxNotice, setMaxNotice] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load existing comparison selections if available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const raw = window.sessionStorage.getItem('kth_compare_candidate_ids');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setSelectedCompareIds(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const toggleCompareCandidate = (id: string) => {
    setSelectedCompareIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) return prev; // Maximum 4 candidates for comparison
        next = [...prev, id];
      }
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.setItem('kth_compare_candidate_ids', JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const handleLaunchCompare = () => {
    if (typeof window !== 'undefined') {
      if (selectedCompareIds.length > 0 && window.sessionStorage) {
        window.sessionStorage.setItem('kth_compare_candidate_ids', JSON.stringify(selectedCompareIds));
      }
      window.history.pushState({}, '', '/employer/candidates/compare');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  useEffect(() => {
    async function loadTaxonomy() {
      const res = await taxonomyService.getCareerCategories();
      if (res.data) setCategories(res.data);
    }
    loadTaxonomy();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCandidates = async () => {
      setIsLoading(true);
      const res = await candidateDiscoveryService.searchCandidates({
        search: searchTerm,
        domain: selectedDomain,
        minExperience: minExp !== 'all' ? Number(minExp) : undefined,
        maxNoticeDays: maxNotice !== 'all' ? Number(maxNotice) : undefined,
        sortBy,
      });

      if (!isMounted) return;
      if (res.data) {
        let list = res.data;
        if (minExp !== 'all') {
          const m = Number(minExp);
          list = list.filter((c) => c.experienceYears >= m);
        }
        if (maxNotice !== 'all') {
          const n = Number(maxNotice);
          list = list.filter((c) => c.noticePeriodDays <= n);
        }
        setCandidates(list);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchCandidates, 250);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [searchTerm, selectedDomain, sortBy, minExp, maxNotice]);

  return (
    <EmployerShell title="Candidate Talent Discovery" currentPath="/employer/candidates">
      <div className="space-y-6">
        {/* Workspace Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex-1 w-full flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search candidate skills (e.g. BRSR, ISO 14001), name, domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="w-full md:w-60">
                <Select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Specializations' },
                    ...categories.map((c) => ({
                      value: c.name.replace(' Careers', ''),
                      label: c.name,
                    })),
                  ]}
                />
              </div>
              <div className="w-full md:w-56">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  options={[
                    { value: 'completion', label: 'Sort: Profile Match' },
                    { value: 'experience_high', label: 'Sort: Experience (High-Low)' },
                    { value: 'experience_low', label: 'Sort: Experience (Low-High)' },
                    { value: 'salary_low', label: 'Sort: Expected CTC (Low-High)' },
                    { value: 'salary_high', label: 'Sort: Expected CTC (High-Low)' },
                    { value: 'notice_fast', label: 'Sort: Immediate Joiners' },
                  ]}
                />
              </div>
            </div>
            <Button
              variant="secondary"
              leftIcon={<GitCompare className="w-4 h-4" />}
              onClick={handleLaunchCompare}
            >
              Compare Candidates {selectedCompareIds.length > 0 && `(${selectedCompareIds.length})`}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-kth-slate-100 text-xs text-kth-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-kth-slate-700">Filter By:</span>
              <select
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
                className="bg-kth-slate-50 border border-kth-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-kth-slate-700 focus:outline-none focus:ring-1 focus:ring-kth-primary-500 font-medium"
              >
                <option value="all">Any Experience</option>
                <option value="1">1+ Years Experience</option>
                <option value="3">3+ Years Experience</option>
                <option value="5">5+ Years Experience</option>
                <option value="8">8+ Years Experience</option>
              </select>

              <select
                value={maxNotice}
                onChange={(e) => setMaxNotice(e.target.value)}
                className="bg-kth-slate-50 border border-kth-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-kth-slate-700 focus:outline-none focus:ring-1 focus:ring-kth-primary-500 font-medium"
              >
                <option value="all">Any Notice Period</option>
                <option value="0">Immediate Joiner (0 days)</option>
                <option value="15">Max 15 Days Notice</option>
                <option value="30">Max 30 Days Notice</option>
                <option value="60">Max 60 Days Notice</option>
              </select>

              {(searchTerm || selectedDomain !== 'all' || minExp !== 'all' || maxNotice !== 'all' || sortBy !== 'completion') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDomain('all');
                    setMinExp('all');
                    setMaxNotice('all');
                    setSortBy('completion');
                  }}
                  className="text-xs text-kth-primary-600 hover:text-kth-primary-800 font-semibold underline ml-1 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <span className="text-kth-slate-500 font-medium">
              Found <strong className="text-kth-slate-900">{isLoading ? '...' : candidates.length}</strong> verified talent profiles
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500">Searching verified candidate talent pool...</p>
          </div>
        ) : candidates.length === 0 ? (
          <Card className="p-12 text-center bg-white border-kth-slate-200">
            <Users className="w-12 h-12 text-kth-slate-300 mx-auto mb-3" />
            <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1">No Matching Candidates Found</h3>
            <p className="text-xs text-kth-slate-500 max-w-sm mx-auto">
              Try broadening your search term or selecting 'All Specializations'.
            </p>
          </Card>
        ) : (
          /* Candidate Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((cand) => (
              <Card key={cand.id} variant="interactive" className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kth-primary-600 to-kth-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {cand.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-kth-slate-900">{cand.name}</h3>
                        <span className="text-xs text-kth-slate-500 font-medium block line-clamp-1">{cand.headline}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompareCandidate(cand.id);
                        }}
                        className={`text-xs px-2 py-1 rounded-md font-medium border transition-colors flex items-center gap-1 ${
                          selectedCompareIds.includes(cand.id)
                            ? 'bg-kth-primary-50 border-kth-primary-300 text-kth-primary-700 font-semibold'
                            : 'bg-white border-kth-slate-200 text-kth-slate-600 hover:border-kth-slate-300'
                        }`}
                        title="Select for comparison"
                      >
                        <GitCompare className="w-3 h-3" />
                        {selectedCompareIds.includes(cand.id) ? 'Selected' : 'Compare'}
                      </button>
                      <Badge variant="emerald" className="font-mono text-xs">
                        {cand.profileCompletion}% Complete
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-kth-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-kth-slate-400" /> {cand.location}
                    </span>
                    <span>{cand.experienceYears}+ Years Exp.</span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-4">
                    {cand.skills.slice(0, 4).map((s, idx) => (
                      <Badge key={idx} variant="indigo" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-kth-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-kth-slate-400 font-mono">Notice: {cand.noticePeriodDays} Days</span>
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-bold text-xs"
                    onClick={() => {
                      window.location.href = `/employer/candidates/${cand.id}`;
                    }}
                  >
                    <span>View Full Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </EmployerShell>
  );
};
