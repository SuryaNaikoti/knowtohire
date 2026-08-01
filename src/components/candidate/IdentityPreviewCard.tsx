import React from 'react';
import { useIdentityWorkspace, type PreviewMode } from '../../context/IdentityWorkspaceContext';
import { User, MapPin, Globe, CheckCircle, ExternalLink, ShieldCheck, Eye, FileText, Lock } from 'lucide-react';

export const IdentityPreviewCard: React.FC = () => {
  const { profile, socialLinks, languages, preferences, privacy, previewMode, setPreviewMode, qualityMetrics } = useIdentityWorkspace();

  const modes: PreviewMode[] = ['Employer View', 'ATS View', 'Public Profile', 'Anonymous Profile'];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6 sticky top-6">
      {/* Recruiter Preview Perspective Selector */}
      <div className="space-y-2 border-b border-slate-800 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Preview Perspective</span>
          </div>
          {privacy.isPublic ? (
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Live
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full">
              Private
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPreviewMode(mode)}
              className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition cursor-pointer text-center ${
                previewMode === mode
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Perspective 1 & 3 & 4: Employer / Public / Anonymous View */}
      {previewMode !== 'ATS View' && (
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-24 h-24 rounded-full border-2 border-emerald-500/40 bg-slate-800 overflow-hidden shadow-inner">
            {profile.avatar_url && previewMode !== 'Anonymous Profile' ? (
              <img src={profile.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                {previewMode === 'Anonymous Profile' ? <Lock className="w-8 h-8 text-amber-400" /> : <User className="w-10 h-10" />}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {previewMode === 'Anonymous Profile'
                ? 'Candidate ID #84920'
                : profile.headline || 'Your Professional Title'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto line-clamp-2">
              {profile.bio || 'Your executive summary bio will appear here in real-time as you write...'}
            </p>
          </div>
        </div>
      )}

      {/* Perspective 2: ATS Raw Parser View */}
      {previewMode === 'ATS View' && (
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>ATS Parsed Record Structure</span>
          </div>
          <p><span className="text-slate-500">HEADLINE:</span> {profile.headline || 'N/A'}</p>
          <p><span className="text-slate-500">PHONE:</span> {privacy.showContactInfo ? profile.phone || 'N/A' : '[HIDDEN BY CANDIDATE]'}</p>
          <p><span className="text-slate-500">LOCATION:</span> {profile.location || 'N/A'}</p>
          <p><span className="text-slate-500">WORK_AUTH:</span> {profile.work_authorization || 'N/A'}</p>
          <p><span className="text-slate-500">ATS READINESS SCORE:</span> {qualityMetrics.atsReadinessScore}%</p>
        </div>
      )}

      {/* Meta Specs Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{profile.location || 'Location Not Specified'}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{profile.work_authorization || 'Work Auth'}</span>
        </div>
        <div className="col-span-2 flex items-center gap-2 text-emerald-400 font-semibold pt-1 border-t border-slate-800/80">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{profile.availability_status || 'Immediately Available'}</span>
        </div>
      </div>

      {/* Preferences Summary */}
      {(preferences.desired_role || preferences.target_salary_min) && (
        <div className="space-y-1.5 text-xs border-t border-slate-800 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Career Preferences</span>
          <div className="flex items-center justify-between text-slate-200">
            <span>Role: {preferences.desired_role || 'Open'}</span>
            {preferences.target_salary_min && (
              <span className="text-emerald-400 font-bold">
                {preferences.currency || '$'}{preferences.target_salary_min.toLocaleString()}/yr
              </span>
            )}
          </div>
        </div>
      )}

      {/* Languages & Social Badges */}
      {languages.length > 0 && (
        <div className="space-y-2 border-t border-slate-800 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spoken Languages</span>
          <div className="flex flex-wrap gap-1.5">
            {languages.map((lang, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-medium rounded-md">
                {lang.language_name} ({lang.proficiency_level})
              </span>
            ))}
          </div>
        </div>
      )}

      {socialLinks.length > 0 && previewMode !== 'Anonymous Profile' && (
        <div className="space-y-2 border-t border-slate-800 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Links</span>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.profile_url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
              >
                <span>{link.platform_name}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Dimensional Readiness Scores */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Multi-Dimensional Intelligence Score</span>
        
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Profile Quality</span>
            <span className="text-sm font-bold text-emerald-400">{qualityMetrics.qualityScore}%</span>
          </div>
          <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block">ATS Readiness</span>
            <span className="text-sm font-bold text-teal-400">{qualityMetrics.atsReadinessScore}%</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Recruiter Appeal Index</span>
            <span className="text-emerald-400">{qualityMetrics.recruiterAppealScore}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${qualityMetrics.recruiterAppealScore}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

