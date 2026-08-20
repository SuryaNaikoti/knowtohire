import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export const HiringOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const [companyName, setCompanyName] = useState<string>(
    (user?.user_metadata?.company_name as string) || 'Your Enterprise'
  );

  useEffect(() => {
    if (!user) return;
    const fetchCompany = async () => {
      try {
        const { data: emp } = await supabase
          .from('employer_profiles')
          .select('company_profiles(name)')
          .eq('profile_id', user.id)
          .maybeSingle();

        const fetchedName = (emp?.company_profiles as any)?.name;
        if (fetchedName) {
          setCompanyName(fetchedName);
        }
      } catch (err) {
        console.debug('Could not load company name:', err);
      }
    };
    fetchCompany();
  }, [user]);

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    (user?.user_metadata?.full_name as string)?.split(' ')[0] ||
    'Recruiter';

  return (
    <div className="bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-kth-slate-900 leading-tight">
          Good morning, {firstName}.
        </h2>
        <p className="text-xs text-kth-slate-500 mt-1">
          Here’s your hiring activity for <strong className="text-kth-slate-800">{companyName}</strong> today.
        </p>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="secondary" size="sm" onClick={() => (window.location.href = '/employer/candidates')}>
          Discover Talent
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => (window.location.href = '/employer/jobs/new')}
        >
          Post a Job
        </Button>
      </div>
    </div>
  );
};
