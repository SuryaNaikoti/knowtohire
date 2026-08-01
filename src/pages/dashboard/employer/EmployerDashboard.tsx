import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Users, FileText, Sparkles, Building2, CheckCircle2, MapPin, PlusCircle, ArrowRight } from 'lucide-react';
import { dashboardService } from '../../../lib/services/dashboardService';
import type { EmployerKPIs } from '../../../lib/services/dashboardService';
import { employerService } from '../../../lib/services/employerService';
import type { Company } from '../../../types/employer.types';
import { CompanyCompletionMeter } from '../../../components/dashboard/CompanyCompletionMeter';
import { Loading } from '../../../components/ui/Loading';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<EmployerKPIs | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const comp = await employerService.getCompanyByEmployer(user.id);
        setCompany(comp);
        const data = await dashboardService.getEmployerKPIs(user.id);
        setKpis(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [user]);

  if (loading || !kpis) {
    return <Loading label="Initializing Employer Intelligence Center..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 bg-[#F9FAFB] dark:bg-slate-950 min-h-screen p-2 sm:p-6 font-sans text-slate-900 dark:text-slate-100 transition-colors animate-fade-in">
      
      {/* 1. EXECUTIVE EMPLOYER HERO COMMAND CENTER */}
      <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Manage {company?.name || 'InnoTech Solutions'} Hiring
              </h1>
              <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-solid border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED EMPLOYER
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl">
              Vetting pipeline, candidate AI intelligence match index, and recruiter team dispatch modules.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => navigate('/dashboard/employer/jobs/create')}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <PlusCircle className="w-4 h-4" /> Create Vacancy
            </button>
            <button 
              onClick={() => navigate('/dashboard/employer/company')}
              className="bg-white dark:bg-slate-800 border border-solid border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" /> Company Profile
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-solid border-slate-100 dark:border-slate-800">
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Active Jobs</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">{kpis.activePostingsCount} Postings</span>
          </div>
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Recruiters</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{kpis.teamCount} Active Team</span>
          </div>
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Company Setup</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">{kpis.completionScore}% Complete</span>
          </div>
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Shortlisted</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">14 Candidates</span>
          </div>
        </div>
      </div>

      {/* Completion Meter */}
      <CompanyCompletionMeter percentage={kpis.completionScore} />

      {/* 2. TOP KPI CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          onClick={() => navigate('/dashboard/employer/jobs')}
          className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Vacancies</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.activePostingsCount}</span>
            <span className="text-xs font-bold text-emerald-600">▲ +14% this month</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Click to manage active postings</p>
        </div>

        <div 
          onClick={() => navigate('/dashboard/employer/team')}
          className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recruiters Team</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.teamCount}</span>
            <span className="text-xs font-bold text-blue-600">Active</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Manage team permissions</p>
        </div>

        <div 
          onClick={() => navigate('/dashboard/employer/locations')}
          className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Office Locations</span>
            <MapPin className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">1 Location</span>
            <span className="text-xs font-bold text-purple-600">Mumbai HQ</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Configure regional offices</p>
        </div>
      </div>

      {/* 3. AI TALENT SCOUT CENTERPIECE */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-solid border-emerald-500/30 space-y-5 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-solid border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-solid border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide">
                AI TALENT SCOUT DIRECTIVES
              </h3>
              <p className="text-xs text-slate-400">Top candidate matches automatically pre-vetted for your open listings</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard/employer/jobs')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1"
          >
            Manage Pipeline <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Pre-vetted candidates list */}
        <div className="space-y-3">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-solid border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                SK
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Surya Naikoti</h4>
                <p className="text-[10px] text-slate-400 font-medium">Senior Frontend Engineer &bull; 8 Yrs Exp</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-950 text-emerald-400 border border-solid border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                94% Match Index
              </span>
              <button 
                onClick={() => navigate('/dashboard/employer/jobs')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-[10px] px-3 py-1 rounded-lg transition cursor-pointer"
              >
                Shortlist Candidate
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EmployerDashboard;
