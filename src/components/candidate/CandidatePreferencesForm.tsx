import React from 'react';
import { useIdentityWorkspace } from '../../context/IdentityWorkspaceContext';
import { Input } from '../ui/Input';
import { Briefcase, DollarSign, Calendar } from 'lucide-react';

export const CandidatePreferencesForm: React.FC = () => {
  const { preferences, updatePreferencesState } = useIdentityWorkspace();

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
        Employment Preferences & Salary Expectations
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Desired Role Title"
          placeholder="e.g. Senior Environmental Engineer"
          leftIcon={<Briefcase className="w-4 h-4" />}
          value={preferences.desired_role || ''}
          onChange={(e) => updatePreferencesState({ desired_role: e.target.value })}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Employment Type</label>
          <select
            value={preferences.employment_type || 'Full-time'}
            onChange={(e) => updatePreferencesState({ employment_type: e.target.value as any })}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Currency</label>
          <select
            value={preferences.currency || 'USD'}
            onChange={(e) => updatePreferencesState({ currency: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
            <option value="CAD">CAD ($)</option>
          </select>
        </div>

        <Input
          label="Current CTC / Salary"
          placeholder="e.g. 95000"
          leftIcon={<DollarSign className="w-4 h-4" />}
          type="number"
          value={preferences.current_ctc || ''}
          onChange={(e) => updatePreferencesState({ current_ctc: e.target.value ? Number(e.target.value) : undefined })}
        />

        <Input
          label="Target Minimum Salary"
          placeholder="e.g. 120000"
          leftIcon={<DollarSign className="w-4 h-4" />}
          type="number"
          value={preferences.target_salary_min || ''}
          onChange={(e) => updatePreferencesState({ target_salary_min: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Expected Joining Date"
          type="date"
          leftIcon={<Calendar className="w-4 h-4" />}
          value={preferences.expected_joining_date || ''}
          onChange={(e) => updatePreferencesState({ expected_joining_date: e.target.value })}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Remote Work Preference</label>
          <select
            value={preferences.remote_preference || 'hybrid'}
            onChange={(e) => updatePreferencesState({ remote_preference: e.target.value as any })}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="hybrid">Hybrid (Office + Remote)</option>
            <option value="remote">Fully Remote</option>
            <option value="onsite">On-Site Only</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Travel Willingness</label>
          <select
            value={preferences.travel_willingness || 'No Travel'}
            onChange={(e) => updatePreferencesState({ travel_willingness: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="No Travel">No Travel Required</option>
            <option value="Occasional">Occasional (Up to 25%)</option>
            <option value="Frequent">Frequent (Up to 50%)</option>
            <option value="High Travel">High Travel (&gt; 50%)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
