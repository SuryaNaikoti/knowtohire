import { supabase, isSupabaseConfigured } from '../supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_cents: number;
  billing_cycle: 'monthly' | 'yearly';
  is_active: boolean;
  created_at?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id?: string;
  plan_name: string; // compatibility mapping
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  price_cents: number;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  gateway_subscription_id?: string;
  created_at?: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  order_id?: string;
  subscription_id?: string;
  invoice_number: string;
  amount_cents: number;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  due_date?: string;
  paid_at?: string;
  created_at?: string;
}

const LOCAL_PLANS_KEY = 'kth_subscription_plans';
const LOCAL_SUBS_KEY = (userId: string) => `kth_subscriptions_${userId}`;
const LOCAL_INVOICES_KEY = (userId: string) => `kth_invoices_${userId}`;

const defaultPlans: SubscriptionPlan[] = [
  { id: 'plan-1', name: 'Premium Candidate Plan', slug: 'premium-candidate', description: 'Access premium templates, direct priority applications, and matching feedback.', price_cents: 999, billing_cycle: 'monthly', is_active: true },
  { id: 'plan-2', name: 'Employer Seat Bundle', slug: 'employer-subscription', description: 'Unlock ESG/IPR hiring search filters and add up to 5 team members.', price_cents: 4900, billing_cycle: 'monthly', is_active: true }
];

export const subscriptionService = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('subscription_plans').select('*').eq('is_active', true);
      if (!error && data) return data as SubscriptionPlan[];
    }
    const local = localStorage.getItem(LOCAL_PLANS_KEY);
    if (!local) {
      localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(defaultPlans));
      return defaultPlans;
    }
    return JSON.parse(local);
  },

  getCurrentSubscription: async (userId: string): Promise<UserSubscription | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      if (!error && data) return data as UserSubscription;
    }
    const list: UserSubscription[] = JSON.parse(localStorage.getItem(LOCAL_SUBS_KEY(userId)) || '[]');
    return list.find(s => s.status === 'active') || null;
  },

  createSubscription: async (userId: string, planId: string): Promise<UserSubscription> => {
    const plans = await subscriptionService.getPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) throw new Error('Subscription plan not found.');

    const start = new Date().toISOString();
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    const subData: Omit<UserSubscription, 'id'> = {
      user_id: userId,
      plan_id: plan.id,
      plan_name: plan.name,
      status: 'active',
      price_cents: plan.price_cents,
      billing_cycle: plan.billing_cycle,
      current_period_start: start,
      current_period_end: end,
      cancel_at_period_end: false,
      gateway_subscription_id: `sub_gwy_${Math.random().toString(36).substring(2, 9)}`
    };

    if (isSupabaseConfigured && supabase) {
      // Deactivate any existing active subscriptions first
      await supabase.from('subscriptions').update({ status: 'canceled' }).eq('user_id', userId).eq('status', 'active');
      const { data, error } = await supabase.from('subscriptions').insert(subData).select().single();
      if (error) throw error;
      return data as UserSubscription;
    }

    const key = LOCAL_SUBS_KEY(userId);
    const list: UserSubscription[] = JSON.parse(localStorage.getItem(key) || '[]');
    const canceled = list.map((s): UserSubscription => s.status === 'active' ? { ...s, status: 'canceled' } : s);
    const newSub: UserSubscription = {
      id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      ...subData
    };
    localStorage.setItem(key, JSON.stringify([...canceled, newSub]));

    // Generate Invoice
    await subscriptionService.generateInvoice(userId, newSub.id, plan.price_cents);

    return newSub;
  },

  cancelSubscription: async (userId: string, subscriptionId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('subscriptions').update({ cancel_at_period_end: true }).eq('id', subscriptionId);
      if (error) throw error;
      return true;
    }
    const key = LOCAL_SUBS_KEY(userId);
    const list: UserSubscription[] = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify(list.map(s => s.id === subscriptionId ? { ...s, cancel_at_period_end: true } : s)));
    return true;
  },

  renewSubscription: async (userId: string, subscriptionId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('subscriptions').update({ cancel_at_period_end: false }).eq('id', subscriptionId);
      if (error) throw error;
      return true;
    }
    const key = LOCAL_SUBS_KEY(userId);
    const list: UserSubscription[] = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify(list.map(s => s.id === subscriptionId ? { ...s, cancel_at_period_end: false } : s)));
    return true;
  },

  getInvoices: async (userId: string): Promise<Invoice[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (!error && data) return data as Invoice[];
    }
    return JSON.parse(localStorage.getItem(LOCAL_INVOICES_KEY(userId)) || '[]');
  },

  generateInvoice: async (userId: string, subscriptionId: string, amountCents: number): Promise<Invoice> => {
    const invData: Omit<Invoice, 'id'> = {
      user_id: userId,
      subscription_id: subscriptionId,
      invoice_number: `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      amount_cents: amountCents,
      status: 'paid',
      due_date: new Date().toISOString().split('T')[0],
      paid_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('invoices').insert(invData).select().single();
      if (error) throw error;
      return data as Invoice;
    }

    const key = LOCAL_INVOICES_KEY(userId);
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    const newInv: Invoice = {
      id: `inv_${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
      ...invData
    };
    localStorage.setItem(key, JSON.stringify([newInv, ...current]));
    return newInv;
  }
};
