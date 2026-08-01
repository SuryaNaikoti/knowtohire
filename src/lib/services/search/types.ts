export type SearchEntityType =
  | 'job'
  | 'company'
  | 'template'
  | 'blog'
  | 'resource'
  | 'marketplace';

export type SortOption = 'relevance' | 'date_desc' | 'date_asc';

export interface SearchFilters {
  query: string;
  categories?: SearchEntityType[];
  sort?: SortOption;
  dateRangeDays?: number;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: SearchFilters;
  frequency: 'instant' | 'daily' | 'weekly';
  notificationsEnabled: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  type: SearchEntityType;
  score: number;
  url: string;
  iconName?: string;
  metadata?: Record<string, unknown>;
  highlights?: string[];
}

export interface SearchProvider {
  type: SearchEntityType;
  search(query: string): Promise<SearchResult[]>;
}

export interface SearchAnalyticsEvent {
  query: string;
  entityType?: SearchEntityType;
  totalResults: number;
  selectedResultId?: string;
  latencyMs: number;
}
