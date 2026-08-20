import React, { useState, useEffect } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { interviewService, Interview } from '@/services/interviewService';
import { Calendar, Clock, Video, MapPin, Building2, Loader2 } from 'lucide-react';

export const CandidateInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    interviewService.getMyInterviews().then((res) => {
      if (!isMounted) return;
      if (res.data) {
        setInterviews(res.data);
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="emerald">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="slate">Completed</Badge>;
      case 'rescheduled':
        return <Badge variant="amber">Rescheduled</Badge>;
      case 'cancelled':
        return <Badge variant="rose">Cancelled</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const getInterviewTypeName = (type: string) => {
    switch (type) {
      case 'hr_screening':
        return 'HR Talent Screening';
      case 'technical_deep_dive':
        return 'Technical & Domain Deep Dive';
      case 'case_study':
        return 'Case Study & Presentation';
      case 'executive_review':
        return 'Leadership & Culture Fit';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  return (
    <CandidateShell title="My Scheduled Interviews" currentPath="/candidate/interviews">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display text-lg font-bold text-kth-slate-900">Upcoming & Past Rounds</h2>
            <p className="text-xs text-kth-slate-500">Live recruitment schedule with meeting links and recruiter details.</p>
          </div>
          <Badge variant="indigo" className="font-mono">{interviews.length} Total Scheduled</Badge>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500">Retrieving your interview schedule...</p>
          </div>
        ) : interviews.length === 0 ? (
          <Card className="p-12 text-center bg-white border-kth-slate-200">
            <Calendar className="w-12 h-12 text-kth-slate-300 mx-auto mb-3" />
            <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1">No Interviews Scheduled Yet</h3>
            <p className="text-xs text-kth-slate-500 max-w-sm mx-auto mb-6">
              When recruiters review your job applications and move you to the interview stage, your meeting details and join links will appear here.
            </p>
            <Button variant="primary" onClick={() => (window.location.href = '/candidate/jobs')}>
              Discover Relevant Jobs
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => {
              const startDate = new Date(interview.scheduled_start);
              return (
                <Card key={interview.id} className="p-6 transition-all hover:border-kth-primary-200 hover:shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(interview.status)}
                        <Badge variant="cyan">{getInterviewTypeName(interview.interview_type)}</Badge>
                      </div>

                      <h3 className="font-display text-base font-bold text-kth-slate-900">
                        {interview.title || `${getInterviewTypeName(interview.interview_type)}`}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-kth-slate-600">
                        <div className="flex items-center gap-1.5 font-medium text-kth-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-kth-slate-400" />
                          <span>{(interview as any).company?.name || 'Recruiting Enterprise'}</span>
                        </div>

                        {interview.job?.title && (
                          <div className="flex items-center gap-1.5 text-kth-slate-600">
                            <span className="text-kth-slate-400">Position:</span>
                            <span className="font-semibold">{interview.job.title}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 font-mono text-kth-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-kth-primary-600" />
                          <span>
                            {startDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-kth-slate-700">
                          <Clock className="w-3.5 h-3.5 text-kth-primary-600" />
                          <span>
                            {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {interview.notes && (
                        <div className="text-xs bg-kth-slate-50 border border-kth-slate-200 rounded p-3 text-kth-slate-700 mt-2">
                          <strong className="text-kth-slate-900">Recruiter Preparation Note:</strong> {interview.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
                      {interview.meeting_link ? (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Video className="w-4 h-4" />}
                          onClick={() => window.open(interview.meeting_link || '#', '_blank')}
                        >
                          Join Meeting Call
                        </Button>
                      ) : interview.location ? (
                        <div className="flex items-center gap-1 text-xs text-kth-slate-600 font-medium">
                          <MapPin className="w-4 h-4 text-kth-slate-400" /> {interview.location}
                        </div>
                      ) : (
                        <span className="text-xs text-kth-slate-400 italic">Meeting details pending</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CandidateShell>
  );
};
