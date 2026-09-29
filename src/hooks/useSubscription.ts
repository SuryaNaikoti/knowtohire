import { useState, useEffect, useCallback } from 'react';
import {
  subscriptionEntitlementService,
  SubscriptionStatusInfo,
  GatedFeature,
} from '@/services/subscriptionEntitlementService';
import { useAuth } from '@/context/AuthContext';

export function useSubscription() {
  const { role } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatusInfo>({
    isActive: false,
    tier: 'free',
    billingCycle: 'monthly',
    isExpired: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (role !== 'employer') {
      setIsLoading(false);
      return;
    }
    try {
      const res = await subscriptionEntitlementService.getSubscriptionStatus();
      setStatus(res);
    } catch {
      setStatus({
        isActive: false,
        tier: 'free',
        billingCycle: 'monthly',
        isExpired: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchStatus();

    const handleProfileUpdate = () => {
      fetchStatus();
    };

    window.addEventListener('kth_company_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('kth_company_profile_updated', handleProfileUpdate);
    };
  }, [fetchStatus]);

  const checkFeature = useCallback(
    async (feature: GatedFeature) => {
      return subscriptionEntitlementService.hasFeature(feature);
    },
    []
  );

  const checkJobPostingLimit = useCallback(async () => {
    return subscriptionEntitlementService.canPostJob();
  }, []);

  return {
    ...status,
    isLoading,
    refreshSubscription: fetchStatus,
    checkFeature,
    checkJobPostingLimit,
    isStarter: status.tier === 'starter',
    isEnterprise: status.tier === 'enterprise',
  };
}
