import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Card } from '../../components/ui/Card';
import { Briefcase, Building, ChevronRight } from 'lucide-react';

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectRole = async (role: 'candidate' | 'employer') => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Initialize secondary profile row if employer (candidate is done via SQL trigger function)
      if (role === 'employer') {
        const { error: employerError } = await supabase
          .from('employer_profiles')
          .insert({ id: user.id });
        if (employerError) throw employerError;
      }

      await refreshProfile();
      navigate(`/onboarding/${role}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign workspace role selection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Choose Workspace" subtitle="Select your portal access type to continue.">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xs font-semibold leading-relaxed">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        {[
          {
            role: 'candidate' as const,
            title: 'Candidate Profile',
            desc: 'Search active openings, build vetting portfolios, and download templates.',
            icon: Briefcase,
            color: 'from-blue-500 to-indigo-500'
          },
          {
            role: 'employer' as const,
            title: 'Employer & Recruiter',
            desc: 'Moderate company pipelines, list jobs, and scout matching candidates.',
            icon: Building,
            color: 'from-emerald-500 to-teal-500'
          }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.role}
              onClick={() => !loading && selectRole(item.role)}
              hoverEffect
              className="border border-slate-200 p-6 rounded-[24px] shadow-sm flex items-center justify-between group cursor-pointer text-left focus:ring-2 focus:ring-emerald-500/20"
            >
              <div className="flex gap-4">
                <div className="relative w-12 h-12 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-slate-800" />
                  </div>
                  <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-15 blur-sm transition-opacity`} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-none">{item.title}</h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </Card>
          );
        })}
      </div>
    </AuthLayout>
  );
};

export default RoleSelection;
