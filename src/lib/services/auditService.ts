import { supabase, isSupabaseConfigured } from '../supabase';

export type AuditCategory = 'Auth' | 'Job' | 'Candidate' | 'Employer' | 'Application' | 'Marketplace';

export interface AuditLog {
  id: string;
  actorId: string;
  category: AuditCategory;
  action: string;
  targetId?: string;
  metadata?: any;
  ipAddress?: string;
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'kth_audit_logs';

const getLocalAuditLogs = (): AuditLog[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) return JSON.parse(data);
    // Seed initial data
    const seedLogs: AuditLog[] = [
      { id: '1', actorId: 'Sarah Vance', category: 'Employer', action: 'Created vacancy profile', targetId: 'job-1', created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
      { id: '2', actorId: 'Alex Johnson', category: 'Candidate', action: 'Downloaded resume template', targetId: 'temp-1', created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
      { id: '3', actorId: 'System Worker', category: 'Auth', action: 'Synced authentication accounts', created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { id: '4', actorId: 'Unknown User', category: 'Auth', action: 'Failed route authorization', created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seedLogs));
    return seedLogs;
  } catch (err) {
    console.error('Failed to parse/seed audit logs from localStorage', err);
    return [];
  }
};

const saveLocalAuditLogs = (logs: AuditLog[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save audit logs to localStorage', err);
  }
};

export const auditService = {
  logEvent: async (
    actorId: string,
    category: AuditCategory,
    action: string,
    targetId?: string,
    metadata?: any
  ): Promise<boolean> => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      actorId,
      category,
      action,
      targetId,
      metadata,
      ipAddress: '127.0.0.1',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        // Map to activity_logs schema: user_id, action (string), details (JSONB), ip_address
        const { error } = await supabase.from('activity_logs').insert({
          user_id: actorId,
          action: `[${category}] ${action}`,
          details: { category, target_id: targetId, ...metadata },
          ip_address: newLog.ipAddress,
        });
        if (!error) return true;
        console.warn('Activity log insert failed, falling back to local storage', error);
      } catch (err) {
        console.warn('Activity log insert exception, falling back to local storage', err);
      }
    }

    const localLogs = getLocalAuditLogs();
    localLogs.unshift(newLog);
    saveLocalAuditLogs(localLogs);
    return true;
  },

  getAuditLogs: async (category?: AuditCategory): Promise<AuditLog[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        // activity_logs real schema: id, user_id, action, details (JSONB), ip_address, created_at
        let query = supabase
          .from('activity_logs')
          .select('id, user_id, action, details, ip_address, created_at')
          .order('created_at', { ascending: false })
          .limit(100);

        if (category) {
          query = query.eq('details->>category', category);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            actorId: item.user_id ?? 'System',
            category: (item.details?.category ?? 'Auth') as AuditCategory,
            action: item.action,
            targetId: item.details?.target_id,
            metadata: item.details,
            ipAddress: item.ip_address,
            created_at: item.created_at,
          }));
        }
        console.warn('Activity logs fetch failed, falling back to local storage', error);
      } catch (err) {
        console.warn('Activity logs fetch exception, falling back to local storage', err);
      }
    }

    const localLogs = getLocalAuditLogs();
    if (category) {
      return localLogs.filter(log => log.category === category);
    }
    return localLogs;
  },
};
