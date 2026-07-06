import { supabase } from '../supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export type EventType =
  | 'page_view'
  | 'click'
  | 'search'
  | 'template_view'
  | 'template_purchase'
  | 'job_view'
  | 'job_apply'
  | 'blog_view'
  | 'blog_share'
  | 'lead_magnet_download'
  | 'resource_request_submit'
  | 'resource_request_upvote'
  | 'profile_view'
  | 'subscription_start'
  | 'subscription_cancel'
  | 'login'
  | 'register'
  | 'error';

export type EventCategory =
  | 'general'
  | 'marketplace'
  | 'blog'
  | 'jobs'
  | 'profile'
  | 'billing'
  | 'auth'
  | 'content';

export interface AnalyticsEvent {
  event_type: EventType;
  event_category: EventCategory;
  entity_type?: string;
  entity_id?: string;
  properties?: Record<string, unknown>;
  page_url?: string;
  session_id?: string;
}

export interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  topPages: { page_url: string; count: number }[];
  eventBreakdown: { event_type: string; count: number }[];
  recentEvents: any[];
}

// ─── Analytics Service ────────────────────────────────────────────────────────

export const analyticsService = {
  // Session tracking
  _sessionId: null as string | null,

  getSessionId(): string {
    if (!this._sessionId) {
      const stored = sessionStorage.getItem('kth_session_id');
      if (stored) {
        this._sessionId = stored;
      } else {
        const newId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        sessionStorage.setItem('kth_session_id', newId);
        this._sessionId = newId;
      }
    }
    return this._sessionId;
  },

  async track(event: AnalyticsEvent) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('analytics_events').insert({
        user_id: user?.id ?? null,
        session_id: this.getSessionId(),
        event_type: event.event_type,
        event_category: event.event_category,
        entity_type: event.entity_type ?? null,
        entity_id: event.entity_id ?? null,
        properties: event.properties ?? {},
        page_url: event.page_url ?? window.location.href,
      });
    } catch {
      // Analytics should never break the app
    }
  },

  async trackPageView(pageUrl?: string) {
    return this.track({
      event_type: 'page_view',
      event_category: 'general',
      page_url: pageUrl ?? window.location.href,
    });
  },

  // Admin analytics queries
  async getAdminStats(days = 30): Promise<DashboardStats> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceIso = since.toISOString();

    const [eventsRes, usersRes, topPagesRes, breakdownRes, recentRes] = await Promise.all([
      // Total events
      supabase
        .from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sinceIso),

      // Unique users
      supabase
        .from('analytics_events')
        .select('user_id')
        .gte('created_at', sinceIso)
        .not('user_id', 'is', null),

      // Top pages
      supabase
        .from('analytics_events')
        .select('page_url')
        .eq('event_type', 'page_view')
        .gte('created_at', sinceIso)
        .limit(100),

      // Event breakdown
      supabase
        .from('analytics_events')
        .select('event_type')
        .gte('created_at', sinceIso)
        .limit(1000),

      // Recent events
      supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    // Aggregate top pages
    const pageCounts: Record<string, number> = {};
    for (const row of topPagesRes.data ?? []) {
      if (row.page_url) {
        pageCounts[row.page_url] = (pageCounts[row.page_url] ?? 0) + 1;
      }
    }
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page_url, count]) => ({ page_url, count }));

    // Aggregate event breakdown
    const eventCounts: Record<string, number> = {};
    for (const row of breakdownRes.data ?? []) {
      eventCounts[row.event_type] = (eventCounts[row.event_type] ?? 0) + 1;
    }
    const eventBreakdown = Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([event_type, count]) => ({ event_type, count }));

    const uniqueUsers = new Set((usersRes.data ?? []).map((r) => r.user_id)).size;

    return {
      totalEvents: eventsRes.count ?? 0,
      totalUsers: uniqueUsers,
      topPages,
      eventBreakdown,
      recentEvents: recentRes.data ?? [],
    };
  },

  async getEntityAnalytics(entityType: string, entityId: string) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ─── Audit Service ────────────────────────────────────────────────────────────

export interface AuditEntry {
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

export const auditService = {
  async log(entry: AuditEntry) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('audit_logs').insert({
        user_id: user?.id ?? null,
        action: entry.action,
        table_name: entry.table_name ?? null,
        record_id: entry.record_id ?? null,
        old_values: entry.old_values ?? null,
        new_values: entry.new_values ?? null,
        metadata: entry.metadata ?? {},
        severity: entry.severity ?? 'info',
      });
    } catch {
      // Audit logging should never break the app
    }
  },

  async getAdminLogs(filters: { severity?: string; table?: string; limit?: number } = {}) {
    const { severity, table, limit = 50 } = filters;

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (severity) query = query.eq('severity', severity);
    if (table) query = query.eq('table_name', table);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};
