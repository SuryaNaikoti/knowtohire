import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { companyProfileService } from '@/services';
import { Button } from '@/components/ui/Button';
import { navigateTo } from '@/utils/navigation';
import { Plus, Users } from 'lucide-react';

export const HiringOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const [companyName, setCompanyName] = useState<string>(
    (user?.user_metadata?.company_name as string) || 'EcoStrategy India Pvt Ltd'
  );

  const fetchCompany = useCallback(async () => {
    try {
      const res = await companyProfileService.getMyCompanyProfile();
      if (res.data?.name) {
        setCompanyName(res.data.name);
      }
    } catch (err) {
      console.debug('Could not load company name in HiringOverview:', err);
    }
  }, []);

  useEffect(() => {
    fetchCompany();

    const handleCompanyUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ name?: string }>;
      if (custom.detail?.name) {
        setCompanyName(custom.detail.name);
      } else {
        fetchCompany();
      }
    };

    window.addEventListener('kth_company_profile_updated', handleCompanyUpdated);
    return () => {
      window.removeEventListener('kth_company_profile_updated', handleCompanyUpdated);
    };
  }, [fetchCompany]);

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    (user?.user_metadata?.full_name as string)?.split(' ')[0] ||
    'Vikram';

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 font-sans">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-kth-slate-900 leading-tight">
          Good morning, {firstName}.
        </h2>
        <p className="text-xs text-kth-slate-500 mt-0.5 sm:mt-1">
          Here’s your hiring activity for <strong className="text-kth-slate-900 font-semibold">{companyName}</strong> today.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
        <Button
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto justify-center text-xs"
          leftIcon={<Users className="w-4 h-4 text-kth-slate-600" />}
          onClick={() => navigateTo('/employer/candidates')}
        >
          Discover Talent
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="w-full sm:w-auto justify-center text-xs"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigateTo('/employer/jobs/new')}
        >
          Post a Job
        </Button>
      </div>
    </div>
  );
};
