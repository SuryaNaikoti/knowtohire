/**
 * KnowToHire Subscription Entitlement Service
 * Single source of truth for plan capabilities, feature gating, limits, and subscription verification.
 */

import { subscriptionService } from './payment/subscriptionService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type SubscriptionTier = 'free' | 'starter' | 'enterprise';

export interface PlanLimits {
  maxActiveJobs: number;
  unlimitedJobs: boolean;
  atsKanban: boolean;
  analytics: boolean;
  verifiedBadge: boolean;
  dedicatedManager: boolean;
  customLegalGst: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  free: {
    maxActiveJobs: 2,
    unlimitedJobs: false,
    atsKanban: false,
    analytics: false,
    verifiedBadge: false,
    dedicatedManager: false,
    customLegalGst: false,
  },
  starter: {
    maxActiveJobs: 5,
    unlimitedJobs: false,
    atsKanban: true,
    analytics: true,
    verifiedBadge: true,
    dedicatedManager: false,
    customLegalGst: false,
  },
  enterprise: {
    maxActiveJobs: Infinity,
    unlimitedJobs: true,
    atsKanban: true,
    analytics: true,
    verifiedBadge: true,
    dedicatedManager: true,
    customLegalGst: true,
  },
};

export type GatedFeature =
  | 'post_job'
  | 'ats_pipeline'
  | 'analytics'
  | 'interviews'
  | 'candidate_discovery'
  | 'verified_badge'
  | 'dedicated_manager'
  | 'custom_legal_gst';

export interface SubscriptionStatusInfo {
  isActive: boolean;
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'annual';
  expiresAt?: string;
  isExpired: boolean;
  companyId?: string;
}

export const subscriptionEntitlementService = {
  /**
   * Get subscription status for an employer company.
   */
  async getSubscriptionStatus(companyId?: string): Promise<SubscriptionStatusInfo> {
    const raw = await subscriptionService.getSubscriptionStatus(companyId);
    
    // Check expiry
    let isExpired = false;
    if (raw.expiresAt) {
      const expiry = new Date(raw.expiresAt).getTime();
      if (!isNaN(expiry) && expiry < Date.now()) {
        isExpired = true;
      }
    }

    const isActive = raw.isActive && !isExpired;
    const tier = isActive ? (raw.tier as SubscriptionTier) : 'free';

    return {
      isActive,
      tier: (tier === 'enterprise' ? 'enterprise' : tier === 'starter' ? 'starter' : 'free'),
      billingCycle: (raw.billingCycle as 'monthly' | 'annual') || 'monthly',
      expiresAt: raw.expiresAt,
      isExpired,
      companyId,
    };
  },

  /**
   * Check if a feature is allowed for the employer's current plan.
   */
  async hasFeature(feature: GatedFeature, companyId?: string): Promise<{
    allowed: boolean;
    reason?: string;
    requiredTier?: SubscriptionTier;
    currentTier: SubscriptionTier;
  }> {
    const status = await this.getSubscriptionStatus(companyId);
    const limits = PLAN_LIMITS[status.tier];

    // Gated features that require an active paid subscription
    if (!status.isActive) {
      if (feature === 'post_job') {
        // Free tier allows up to 2 active jobs
        return {
          allowed: true,
          currentTier: 'free',
          requiredTier: 'free',
        };
      }

      return {
        allowed: false,
        reason: status.isExpired
          ? 'Your subscription has expired. Please renew your plan to continue accessing this feature.'
          : 'An active employer subscription is required to access advanced recruitment features.',
        requiredTier: 'starter',
        currentTier: status.tier,
      };
    }

    switch (feature) {
      case 'post_job':
        return {
          allowed: limits.maxActiveJobs > 0,
          currentTier: status.tier,
          requiredTier: 'free',
        };

      case 'ats_pipeline':
        return {
          allowed: limits.atsKanban,
          currentTier: status.tier,
          requiredTier: 'starter',
        };

      case 'analytics':
        return {
          allowed: limits.analytics,
          currentTier: status.tier,
          requiredTier: 'starter',
        };

      case 'candidate_discovery':
      case 'interviews':
      case 'verified_badge':
        return {
          allowed: true,
          currentTier: status.tier,
          requiredTier: 'starter',
        };

      case 'dedicated_manager':
      case 'custom_legal_gst':
        return {
          allowed: limits[feature === 'dedicated_manager' ? 'dedicatedManager' : 'customLegalGst'],
          reason: limits[feature === 'dedicated_manager' ? 'dedicatedManager' : 'customLegalGst']
            ? undefined
            : 'This feature is only available on the Enterprise plan.',
          requiredTier: 'enterprise',
          currentTier: status.tier,
        };

      default:
        return {
          allowed: true,
          currentTier: status.tier,
        };
    }
  },

  /**
   * Verify if the employer can publish an additional active job.
   * Free tier (no subscription): 2 free active jobs with minimal features.
   * Starter plan: max 5 active published jobs.
   * Enterprise plan: unlimited.
   */
  async canPostJob(companyId?: string): Promise<{
    canPost: boolean;
    activeCount: number;
    maxAllowed: number;
    reason?: string;
    tier: SubscriptionTier;
  }> {
    const status = await this.getSubscriptionStatus(companyId);
    const effectiveTier: SubscriptionTier = status.isActive ? status.tier : 'free';
    const limits = PLAN_LIMITS[effectiveTier];

    if (limits.unlimitedJobs) {
      return {
        canPost: true,
        activeCount: 0,
        maxAllowed: Infinity,
        tier: effectiveTier,
      };
    }

    // Count published/active jobs for this company
    let activeCount = 0;
    try {
      if (isSupabaseConfigured()) {
        const query = supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published');

        if (companyId) {
          query.eq('company_id', companyId);
        }

        const { count, error } = await query;
        if (!error && count !== null) {
          activeCount = count;
        }
      }
    } catch {
      // In local or offline mode, fall back to counting localStorage/mock jobs
      activeCount = 0;
    }

    // Also check local created jobs if activeCount is 0 or to ensure local mode accuracy
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem('kth_local_created_jobs');
        if (raw) {
          const localJobs = JSON.parse(raw);
          if (Array.isArray(localJobs)) {
            const localPublished = localJobs.filter(
              (j: any) =>
                j.status === 'published' &&
                (!companyId || !j.company_id || j.company_id === companyId)
            );
            activeCount = Math.max(activeCount, localPublished.length);
          }
        }
      } catch {
        // ignore
      }
    }

    const canPost = activeCount < limits.maxActiveJobs;
    const isFree = effectiveTier === 'free';

    return {
      canPost,
      activeCount,
      maxAllowed: limits.maxActiveJobs,
      reason: canPost
        ? undefined
        : isFree
        ? `You have reached your limit of ${limits.maxActiveJobs} free job posts. Upgrade to Employer Starter to post up to 5 jobs with ATS pipeline, candidate comparison, and analytics.`
        : `You have reached the maximum of ${limits.maxActiveJobs} active job postings for the Starter plan. Upgrade to Enterprise for unlimited job postings.`,
      tier: effectiveTier,
    };
  },
};
