import { supabase, isSupabaseConfigured } from '../supabase';

export interface JobAlert {
  id: string;
  candidate_id: string;
  keywords?: string;
  location?: string;
  department?: string;
  employment_type?: string;
  location_type?: string;
  min_salary?: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const LOCAL_KEY = (id: string) => `kth_alerts_${id}`;

const getLocal = (candidateId: string): JobAlert[] => {
  try {
    const d = localStorage.getItem(LOCAL_KEY(candidateId));
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
};

const setLocal = (candidateId: string, alerts: JobAlert[]) => {
  localStorage.setItem(LOCAL_KEY(candidateId), JSON.stringify(alerts));
};

export const alertsService = {
  getAlerts: async (candidateId: string): Promise<JobAlert[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('candidate_id', candidateId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[alertsService.getAlerts error]', error);
        return getLocal(candidateId);
      }
      return data as JobAlert[];
    }
    return getLocal(candidateId);
  },

  upsertAlert: async (alert: Omit<JobAlert, 'id'> & { id?: string }): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('job_alerts').upsert(alert);
      if (error) {
        console.error('[alertsService.upsertAlert error]', error);
        throw error;
      }
      return true;
    }
    const current = getLocal(alert.candidate_id);
    if (alert.id) {
      setLocal(alert.candidate_id, current.map((a) => a.id === alert.id ? { ...a, ...alert } as JobAlert : a));
    } else {
      const newAlert: JobAlert = {
        ...alert,
        id: `alert_${Math.random().toString(36).substring(2, 9)}`,
      } as JobAlert;
      if (!newAlert.frequency) newAlert.frequency = 'weekly';
      if (newAlert.is_active === undefined) newAlert.is_active = true;
      setLocal(alert.candidate_id, [newAlert, ...current]);
    }
    return true;
  },

  deleteAlert: async (candidateId: string, alertId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('job_alerts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', alertId);
      if (error) {
        console.error('[alertsService.deleteAlert error]', error);
        throw error;
      }
      return true;
    }
    const current = getLocal(candidateId);
    setLocal(candidateId, current.filter((a) => a.id !== alertId));
    return true;
  },

  toggleAlert: async (candidateId: string, alertId: string, isActive: boolean): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('job_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);
      if (error) {
        console.error('[alertsService.toggleAlert error]', error);
        throw error;
      }
      return true;
    }
    const current = getLocal(candidateId);
    setLocal(candidateId, current.map((a) => a.id === alertId ? { ...a, is_active: isActive } : a));
    return true;
  },
};
