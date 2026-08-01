import type {
  PipelineStage,
  CandidatePipeline,
  CandidateShortlist,
  TalentPool,
  InterviewSchedule,
  InterviewFeedback,
  CandidateEvaluation,
  EmployerDashboardSummary,
  IEmployerPipelineService,
  ICandidateShortlistService,
  ITalentPoolService,
  IInterviewQueueService,
  ICandidateEvaluationService,
  IEmployerDashboardSummaryService
} from './employerTypes';
import { analyticsService } from '../analyticsService';

export class EmployerPipelineService implements IEmployerPipelineService {
  async addCandidate(candidateId: string, jobId: string): Promise<CandidatePipeline> {
    const pipeline: CandidatePipeline = {
      id: `pipe_${Date.now()}`,
      candidateId,
      jobId,
      stage: 'Applied',
      updatedAt: new Date().toISOString()
    };
    
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Candidate Added', candidateId, jobId }
    });

    return pipeline;
  }

  async removeCandidate(candidateId: string, jobId: string): Promise<boolean> {
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Candidate Removed', candidateId, jobId }
    });
    return true;
  }

  async moveStage(candidateId: string, jobId: string, newStage: PipelineStage): Promise<CandidatePipeline> {
    const pipeline: CandidatePipeline = {
      id: `pipe_${Date.now()}`,
      candidateId,
      jobId,
      stage: newStage,
      updatedAt: new Date().toISOString()
    };

    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Pipeline Stage Changed', candidateId, jobId, stage: newStage }
    });

    return pipeline;
  }

  async getPipeline(jobId: string): Promise<CandidatePipeline[]> {
    return [
      { id: 'p1', candidateId: 'cand_1', jobId, stage: 'Screening', updatedAt: new Date().toISOString() },
      { id: 'p2', candidateId: 'cand_2', jobId, stage: 'Interview Scheduled', updatedAt: new Date().toISOString() }
    ];
  }
}

export class CandidateShortlistService implements ICandidateShortlistService {
  async createShortlist(employerId: string, name: string): Promise<CandidateShortlist> {
    const shortlist: CandidateShortlist = {
      id: `sl_${Date.now()}`,
      name,
      employerId,
      candidateIds: [],
      notes: {},
      tags: {}
    };

    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Candidate Shortlisted', shortlistName: name }
    });

    return shortlist;
  }

  async addToShortlist(shortlistId: string, candidateId: string, note: string = ''): Promise<CandidateShortlist> {
    return {
      id: shortlistId,
      name: 'Default List',
      employerId: 'emp_1',
      candidateIds: [candidateId],
      notes: { [candidateId]: note },
      tags: {}
    };
  }

  async removeFromShortlist(_shortlistId: string, _candidateId: string): Promise<CandidateShortlist> {
    return {
      id: _shortlistId,
      name: 'Default List',
      employerId: 'emp_1',
      candidateIds: [],
      notes: {},
      tags: {}
    };
  }

  async tagCandidate(shortlistId: string, candidateId: string, tags: string[]): Promise<CandidateShortlist> {
    return {
      id: shortlistId,
      name: 'Default List',
      employerId: 'emp_1',
      candidateIds: [candidateId],
      notes: {},
      tags: { [candidateId]: tags }
    };
  }
}

export class TalentPoolService implements ITalentPoolService {
  async saveCandidate(employerId: string, candidateId: string): Promise<TalentPool> {
    const pool: TalentPool = {
      id: `tp_${Date.now()}`,
      employerId,
      candidateIds: [candidateId]
    };

    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Talent Pool Updated', candidateId }
    });

    return pool;
  }

  async removeCandidate(_employerId: string, _candidateId: string): Promise<TalentPool> {
    return {
      id: 'tp_1',
      employerId: _employerId,
      candidateIds: []
    };
  }

  async searchTalent(_employerId: string, query: { skills?: string[]; minExperience?: number; location?: string }): Promise<string[]> {
    // In production, queries the SupabaseRepository database tables
    console.log('Searching talent pool matching parameters:', query);
    return ['cand_1', 'cand_2'];
  }
}

export class InterviewQueueService implements IInterviewQueueService {
  async scheduleInterview(candidateId: string, jobId: string, time: string, interviewerId: string): Promise<InterviewSchedule> {
    const schedule: InterviewSchedule = {
      id: `int_${Date.now()}`,
      candidateId,
      jobId,
      scheduledTime: time,
      status: 'Scheduled',
      interviewerId
    };

    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Interview Scheduled', candidateId, time }
    });

    return schedule;
  }

  async cancelInterview(_interviewId: string): Promise<boolean> {
    return true;
  }

  async storeFeedback(interviewId: string, feedback: InterviewFeedback): Promise<boolean> {
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Interview Completed', interviewId }
    });
    console.log('Feedback stored successfully:', feedback);
    return true;
  }
}

export class CandidateEvaluationService implements ICandidateEvaluationService {
  async evaluate(candidateId: string, technical: number, communication: number, cultural: number, notes: string): Promise<CandidateEvaluation> {
    const overallScore = Math.round((technical + communication + cultural) / 3);
    return {
      id: `eval_${Date.now()}`,
      candidateId,
      technicalScore: technical,
      communicationScore: communication,
      culturalFitScore: cultural,
      overallScore,
      feedback: notes
    };
  }
}

export class EmployerDashboardSummaryService implements IEmployerDashboardSummaryService {
  async getSummary(employerId: string): Promise<EmployerDashboardSummary> {
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Employer Dashboard Viewed', employerId }
    });

    return {
      activeJobsCount: 3,
      candidatesInPipelineCount: 14,
      interviewsTodayCount: 2,
      offersPendingCount: 1,
      hiresThisMonthCount: 4,
      talentPoolSize: 185,
      averageHiringTimeDays: 18
    };
  }
}
