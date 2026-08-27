import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { savedCandidateService, SavedCandidate } from '@/services';
import { Bookmark, ArrowRight, MapPin, RefreshCw, Trash2 } from 'lucide-react';

export const EmployerSavedCandidatesPage: React.FC = () => {
  const [savedRecords, setSavedRecords] = useState<SavedCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSavedCandidates = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await savedCandidateService.getMySavedCandidates();

    if (error) {
      setErrorMessage(error.message);
      setSavedRecords([]);
    } else if (data) {
      setSavedRecords(data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSavedCandidates();
  }, [loadSavedCandidates]);

  const handleUnsave = async (candidateId: string) => {
    setSavedRecords((prev) => prev.filter((r) => r.candidate_id !== candidateId));
    const { error } = await savedCandidateService.unsaveCandidate(candidateId);
    if (error) {
      loadSavedCandidates();
    }
  };

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <EmployerShell title="Saved Candidate Bench" currentPath="/employer/saved-candidates">
      <div className="space-y-6 font-sans">
        {/* Header Metadata */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-kth-slate-500">
            You have <strong className="text-kth-slate-900 font-mono">{isLoading ? '...' : savedRecords.length} candidates</strong> in your enterprise talent bench
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Saved Bench">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadSavedCandidates} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-kth-slate-200 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-kth-slate-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-kth-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-kth-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-kth-slate-100 rounded w-1/3" />
                <div className="pt-3 border-t border-kth-slate-100 h-8" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && savedRecords.length === 0 && (
          <EmptyState
            title="No Saved Candidates in Bench"
            description="Bookmark standout candidates from your job applicants or ATS pipeline to build your talent bench."
            actionText="View ATS Pipeline"
            onAction={() => handleNavigate('/employer/pipeline')}
            icon={<Bookmark className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Saved Candidates Cards Grid */}
        {!isLoading && !errorMessage && savedRecords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecords.map((record) => {
              const candProfile = record.candidate?.candidate_profile;
              const name = record.candidate?.full_name || 'Candidate';
              const headline = candProfile?.headline || 'Sustainability Specialist';
              const location = candProfile?.location || 'India';
              const skills: string[] = candProfile?.skills || [];

              return (
                <Card key={record.id} variant="interactive" className="p-5 flex flex-col justify-between h-full shadow-xs">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kth-primary-600 to-kth-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-sm text-kth-slate-900">{name}</h3>
                          <span className="text-xs text-kth-slate-500 font-medium block line-clamp-1">{headline}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5"
                        onClick={() => handleUnsave(record.candidate_id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-kth-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-kth-slate-400" /> {location}
                      </span>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {skills.slice(0, 3).map((s, idx) => (
                          <Badge key={idx} variant="slate" className="text-[10px] py-0.5">{s}</Badge>
                        ))}
                      </div>
                    )}

                    {record.notes && (
                      <div className="bg-kth-slate-50 p-2.5 rounded-lg border border-kth-slate-200 text-[11px] text-kth-slate-600 italic mb-3">
                        &quot;{record.notes}&quot;
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-kth-slate-100 flex justify-between items-center text-xs text-kth-slate-400">
                    <span>Saved {new Date(record.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleNavigate(`/employer/candidates/${record.candidate_id}`)}
                    >
                      View in Pipeline <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </EmployerShell>
  );
};
