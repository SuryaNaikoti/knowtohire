import React, { useState, useEffect } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CandidateQuickView } from '@/components/employer/CandidateQuickView';
import { candidateDiscoveryService, DiscoverableCandidate } from '@/services/candidateDiscoveryService';
import { taxonomyService, CareerCategory } from '@/services';
import { Search, MapPin, ArrowRight, GitCompare, Loader2, Users } from 'lucide-react';

export const EmployerCandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<DiscoverableCandidate[]>([]);
  const [categories, setCategories] = useState<CareerCategory[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<DiscoverableCandidate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

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
      });

      if (!isMounted) return;
      if (res.data) {
        setCandidates(res.data);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchCandidates, 250);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [searchTerm, selectedDomain]);

  return (
    <EmployerShell title="Candidate Talent Discovery" currentPath="/employer/candidates">
      <div className="space-y-6">
        {/* Workspace Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search candidate skills (e.g. BRSR, ISO 14001), name, domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-64">
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
          </div>
          <Button
            variant="secondary"
            leftIcon={<GitCompare className="w-4 h-4" />}
            onClick={() => (window.location.href = '/employer/candidates/compare')}
          >
            Compare Candidates
          </Button>
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
                    <Badge variant="emerald" className="font-mono text-xs">
                      {cand.profileCompletion}% Complete
                    </Badge>
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
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCandidate(cand)}>
                    Quick View
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => (window.location.href = `/employer/candidates/${cand.id}`)}
                  >
                    View Profile <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick View Drawer */}
      <CandidateQuickView
        candidate={
          selectedCandidate
            ? {
                id: selectedCandidate.id,
                name: selectedCandidate.name,
                title: selectedCandidate.headline,
                location: selectedCandidate.location,
                experienceYears: selectedCandidate.experienceYears,
                salaryExpectationINR: `₹${(selectedCandidate.expectedSalaryINR / 100000).toFixed(1)}L/yr`,
                matchScore: selectedCandidate.profileCompletion,
                stage: 'New',
                skills: selectedCandidate.skills,
                summary: selectedCandidate.experienceSummary,
                education: selectedCandidate.educationSummary || 'Degree',
                certifications: ['ISO 14001', 'BRSR Reporting'],
                availability: `${selectedCandidate.noticePeriodDays} days notice`,
                isSaved: false,
                skillsMatch: 85,
                experienceMatch: 80,
                locationMatch: 90,
                roleAlignment: 88,
                appliedDate: 'Active Talent',
                appliedRole: selectedCandidate.headline,
              }
            : null
        }
        isOpen={selectedCandidate !== null}
        onClose={() => setSelectedCandidate(null)}
      />
    </EmployerShell>
  );
};
