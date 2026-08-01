export type TelemetryEventType =
  // Candidate Events
  | 'Candidate_Registered'
  | 'Candidate_Profile_Started'
  | 'Candidate_Profile_Completed'
  | 'Experience_Added'
  | 'Evidence_Added'
  | 'Resume_Generated'
  | 'Resume_Downloaded'
  | 'Resume_Shared'
  | 'Job_Search'
  | 'Job_Filter_Applied'
  | 'Job_Viewed'
  | 'Job_Saved'
  | 'Job_Applied'
  | 'Interview_Started'
  | 'Interview_Completed'
  | 'Career_Simulator_Started'
  | 'Career_Simulator_Completed'
  // Employer Events
  | 'Organization_Created'
  | 'Organization_Profile_Completed'
  | 'Opportunity_Created'
  | 'Opportunity_Published'
  | 'Candidate_Search'
  | 'Candidate_Viewed'
  | 'Candidate_Shortlisted'
  | 'Pipeline_Stage_Changed'
  | 'Interview_Scheduled'
  | 'Offer_Created'
  | 'Offer_Accepted';

export interface TelemetryEvent {
  id: string;
  event_type: TelemetryEventType;
  user_id: string;
  user_role: 'candidate' | 'employer' | 'admin';
  organization_id?: string;
  session_id?: string;
  page?: string;
  metadata?: Record<string, any>;
  success: boolean;
  duration_ms?: number;
  timestamp: string;
}

export interface BetaFeedback {
  id: string;
  user_id: string;
  user_role: string;
  feedback_type: 'Report Bug' | 'Suggest Improvement' | 'General Feedback';
  rating: number; // 1-5
  feedback_text: string;
  page_url: string;
  browser_info: string;
  created_at: string;
}

export interface BetaUserInvite {
  id: string;
  email: string;
  role: 'candidate' | 'employer';
  status: 'Pending' | 'Approved' | 'Registered' | 'Suspended';
  cohort_name: string;
  invited_at: string;
}

export interface BetaExitSurveyResponse {
  id: string;
  user_id: string;
  user_role: 'candidate' | 'employer';
  ease_of_onboarding_score: number; // 1-5
  ease_of_core_task_score: number; // 1-5
  score_explainability_trust_score: number; // 1-5
  overall_satisfaction_score: number; // 1-5
  would_recommend_nps: number; // 1-10
  would_be_disappointed_pmf: 'Very disappointed' | 'Somewhat disappointed' | 'Not disappointed';
  open_comments: string;
  created_at: string;
}

export interface UserObservationRecord {
  id: string;
  participant_id: string;
  cohort_name: string;
  device_info: string;
  browser_info: string;
  session_duration_seconds: number;
  tasks_attempted_count: number;
  tasks_completed_count: number;
  help_requested: boolean;
  navigation_confusion_notes?: string;
  errors_encountered_count: number;
  moderator_notes: string;
  created_at: string;
}

class TelemetryService {
  private events: TelemetryEvent[] = [];
  private feedbackList: BetaFeedback[] = [];
  private betaInvites: BetaUserInvite[] = [
    { id: 'inv_1', email: 'pilot.candidate1@knowtohire.com', role: 'candidate', status: 'Registered', cohort_name: 'Alpha Cohort', invited_at: new Date().toISOString() },
    { id: 'inv_2', email: 'pilot.recruiter1@acme.com', role: 'employer', status: 'Registered', cohort_name: 'Employer Cohort A', invited_at: new Date().toISOString() },
  ];

  public track(
    event_type: TelemetryEventType,
    userId: string,
    role: 'candidate' | 'employer' | 'admin',
    options?: {
      organizationId?: string;
      sessionId?: string;
      page?: string;
      metadata?: Record<string, any>;
      success?: boolean;
      durationMs?: number;
    }
  ): TelemetryEvent {
    const event: TelemetryEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event_type,
      user_id: userId,
      user_role: role,
      organization_id: options?.organizationId,
      session_id: options?.sessionId || 'sess_default',
      page: options?.page || (typeof window !== 'undefined' ? window.location.pathname : ''),
      metadata: options?.metadata,
      success: options?.success ?? true,
      duration_ms: options?.durationMs,
      timestamp: new Date().toISOString(),
    };

    this.events.unshift(event);
    console.log(`[TELEMETRY INSTRUMENTATION]: ${event_type}`, event);
    return event;
  }

  public submitFeedback(feedback: Omit<BetaFeedback, 'id' | 'created_at'>): BetaFeedback {
    const item: BetaFeedback = {
      ...feedback,
      id: `fb_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.feedbackList.unshift(item);
    console.log(`[BETA FEEDBACK SUBMITTED]`, item);
    return item;
  }

  public getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  public getFeedback(): BetaFeedback[] {
    return [...this.feedbackList];
  }

  private surveyResponses: BetaExitSurveyResponse[] = [];
  private observationRecords: UserObservationRecord[] = [];

  public submitSurveyResponse(survey: Omit<BetaExitSurveyResponse, 'id' | 'created_at'>): BetaExitSurveyResponse {
    const item: BetaExitSurveyResponse = {
      ...survey,
      id: `surv_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.surveyResponses.unshift(item);
    console.log(`[BETA EXIT SURVEY SUBMITTED]`, item);
    return item;
  }

  public addObservationRecord(record: Omit<UserObservationRecord, 'id' | 'created_at'>): UserObservationRecord {
    const item: UserObservationRecord = {
      ...record,
      id: `obs_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.observationRecords.unshift(item);
    console.log(`[USER OBSERVATION RECORDED]`, item);
    return item;
  }

  public getSurveyResponses(): BetaExitSurveyResponse[] {
    return [...this.surveyResponses];
  }

  public getObservationRecords(): UserObservationRecord[] {
    return [...this.observationRecords];
  }

  public inviteBetaUser(email: string, role: 'candidate' | 'employer', cohort_name: string = 'Beta Cohort 1'): BetaUserInvite {
    const invite: BetaUserInvite = {
      id: `inv_${Date.now()}`,
      email,
      role,
      status: 'Approved',
      cohort_name,
      invited_at: new Date().toISOString(),
    };
    this.betaInvites.unshift(invite);
    return invite;
  }

  public getMetricsSummary() {
    const rawEvents = this.events;
    return {
      total_candidates: new Set(rawEvents.filter((e) => e.user_role === 'candidate').map((e) => e.user_id)).size,
      total_recruiters: new Set(rawEvents.filter((e) => e.user_role === 'employer').map((e) => e.user_id)).size,
      active_sessions: new Set(rawEvents.map((e) => e.session_id)).size,
      resume_generation_count: rawEvents.filter((e) => e.event_type === 'Resume_Generated').length,
      job_applications: rawEvents.filter((e) => e.event_type === 'Job_Applied').length,
      candidate_shortlists: rawEvents.filter((e) => e.event_type === 'Candidate_Shortlisted').length,
      interview_sessions: rawEvents.filter((e) => e.event_type === 'Interview_Started').length,
      feedback_submitted: this.feedbackList.length,
      survey_responses_count: this.surveyResponses.length,
    };
  }
}

export const telemetryService = new TelemetryService();
export default telemetryService;
