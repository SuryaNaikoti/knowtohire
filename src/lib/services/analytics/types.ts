export type AnalyticsCategory =
  | 'search'
  | 'notification'
  | 'job_application'
  | 'marketplace'
  | 'auth'
  | 'background_job';

export interface AnalyticsEvent {
  id: string;
  category: AnalyticsCategory;
  eventName: string;
  timestamp: string;
  userId?: string;
  properties: Record<string, unknown>;
}

export interface AnalyticsSummary {
  totalSearches: number;
  totalNotifications: number;
  totalJobApplications: number;
  activeUsersCount: number;
  clickThroughRate: number;
  topSearchTerms: { term: string; count: number }[];
}
