import React from 'react';
import { useIdentityWorkspace } from '../../context/IdentityWorkspaceContext';
import { Input } from '../ui/Input';
import { Briefcase } from 'lucide-react';

export const CandidateHeadlineBioForm: React.FC = () => {
  const { profile, updateProfileState } = useIdentityWorkspace();

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
        Professional Overview & Bio Summary
      </h3>

      <Input
        label="Professional Headline *"
        placeholder="e.g. Senior Environmental Engineer | EIA & ESG Specialist"
        leftIcon={<Briefcase className="w-4 h-4" />}
        value={profile.headline || ''}
        onChange={(e) => updateProfileState({ headline: e.target.value })}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">About Me Summary (Bio)</label>
          <span className="text-[11px] font-medium text-slate-400">
            {(profile.bio || '').length} / 2000 chars
          </span>
        </div>
        <textarea
          rows={4}
          placeholder="Provide a compelling summary of your core domain expertise, leadership background, and career focus..."
          value={profile.bio || ''}
          onChange={(e) => updateProfileState({ bio: e.target.value })}
          className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-hidden"
        />
      </div>
    </div>
  );
};
