import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { companyProfileService } from '../companyProfileService';

export interface SubscriptionSyncOptions {
  companyId?: string;
  tier: 'starter' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  amountINR: number;
  orderId?: string;
  paymentId?: string;
}

const memoryCompanyProfiles: Record<string, any> = {};

export const subscriptionService = {
  /**
   * Synchronizes an activated employer subscription with the company profile in Supabase and local store.
   */
  async activateCompanySubscription(options: SubscriptionSyncOptions): Promise<boolean> {
    const { tier, billingCycle, orderId, paymentId } = options;

    let targetCompanyId = options.companyId;

    if (!targetCompanyId) {
      const myComp = await companyProfileService.getMyCompanyProfile();
      if (myComp.data?.id) {
        targetCompanyId = myComp.data.id;
      }
    }

    if (!targetCompanyId) {
      console.warn('[SubscriptionService] No target company ID found for subscription activation.');
      return false;
    }

    // Expiration date (30 days for monthly, 365 days for annual)
    const now = new Date();
    const expiresAt = new Date(
      billingCycle === 'annual'
        ? now.getTime() + 365 * 24 * 60 * 60 * 1000
        : now.getTime() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const subDetails = {
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_billing_cycle: billingCycle,
      subscription_expires_at: expiresAt,
      subscription_order_id: orderId || null,
      subscription_payment_id: paymentId || null,
      subscription_updated_at: now.toISOString(),
    };

    // 1. Update companyProfileService in-memory & localStorage store
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(`kth_company_profile_${targetCompanyId}`);
        const current = raw ? JSON.parse(raw) : {};
        const merged = { ...current, ...subDetails };
        window.localStorage.setItem(`kth_company_profile_${targetCompanyId}`, JSON.stringify(merged));

        window.dispatchEvent(
          new CustomEvent('kth_company_profile_updated', {
            detail: { companyId: targetCompanyId, ...subDetails },
          })
        );
      } else {
        const current = memoryCompanyProfiles[targetCompanyId] || {};
        memoryCompanyProfiles[targetCompanyId] = { ...current, ...subDetails };
      }
    } catch {
      const current = memoryCompanyProfiles[targetCompanyId] || {};
      memoryCompanyProfiles[targetCompanyId] = { ...current, ...subDetails };
    }

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('company_profiles')
          .update(subDetails)
          .eq('id', targetCompanyId);

        if (error) {
          console.warn('[SubscriptionService] Supabase company subscription update warning:', error.message);
        }
      } catch (err) {
        console.warn('[SubscriptionService] Supabase company subscription update warning:', err);
      }
    }

    return true;
  },

  /**
   * Check company subscription status.
   * Supabase is the authoritative source of truth when configured.
   * Does NOT show ACTIVE solely from localStorage if server-side status is inactive.
   */
  async getSubscriptionStatus(companyId?: string): Promise<{
    isActive: boolean;
    tier: string;
    billingCycle: string;
    expiresAt?: string;
  }> {
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const myComp = await companyProfileService.getMyCompanyProfile();
      targetCompanyId = myComp.data?.id;
    }

    if (!targetCompanyId) {
      return {
        isActive: false,
        tier: 'free',
        billingCycle: 'monthly',
      };
    }

    let compData: any = null;

    // 1. Query Supabase authoritatively first if configured
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('company_profiles')
          .select('subscription_tier, subscription_status, subscription_billing_cycle, subscription_expires_at')
          .eq('id', targetCompanyId)
          .maybeSingle();
        if (data) {
          compData = data;
        }
      } catch {
        // ignore
      }
    }

    // 2. In unconfigured/offline demo mode, fall back to memory or localStorage
    if (!compData && !isSupabaseConfigured()) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem(`kth_company_profile_${targetCompanyId}`);
          if (raw) compData = JSON.parse(raw);
        } catch {
          // ignore
        }
      } else {
        compData = memoryCompanyProfiles[targetCompanyId] || null;
      }
    }

    const isActive = compData?.subscription_status === 'active';
    return {
      isActive,
      tier: compData?.subscription_tier || (isActive ? 'starter' : 'free'),
      billingCycle: compData?.subscription_billing_cycle || 'monthly',
      expiresAt: compData?.subscription_expires_at,
    };
  },
};
