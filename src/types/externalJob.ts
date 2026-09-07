/**
 * Type definitions for Admin-Managed Curated External Jobs
 */

export type ExternalJobSection = 'latest' | 'fresher' | 'walk_in';

export type ExternalJobStatus = 'draft' | 'published';

export interface ExternalJob {
  id: string;
  title: string;
  company_name?: string | null;
  location?: string | null;
  description?: string | null;
  redirect_url: string;
  section: ExternalJobSection;
  status: ExternalJobStatus;
  display_order: number;
  published_from?: string | null;
  published_until?: string | null;
  link_label?: string | null;
  click_count?: number;
  impression_count?: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExternalJobFilterParams {
  section?: ExternalJobSection | 'all';
  status?: ExternalJobStatus | 'all';
  search?: string;
  limit?: number;
}

export interface CreateExternalJobInput {
  title: string;
  redirect_url: string;
  section: ExternalJobSection;
  status?: ExternalJobStatus;
  company_name?: string;
  location?: string;
  description?: string;
  display_order?: number;
  published_from?: string | null;
  published_until?: string | null;
  link_label?: string;
}

export interface UpdateExternalJobInput {
  title?: string;
  redirect_url?: string;
  section?: ExternalJobSection;
  status?: ExternalJobStatus;
  company_name?: string | null;
  location?: string | null;
  description?: string | null;
  display_order?: number;
  published_from?: string | null;
  published_until?: string | null;
  link_label?: string | null;
}
