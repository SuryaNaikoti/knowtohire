import React from 'react';
import { useIdentityWorkspace } from '../../context/IdentityWorkspaceContext';
import { AvatarUploadCrop } from './AvatarUploadCrop';
import { CandidateHeadlineBioForm } from './CandidateHeadlineBioForm';
import { CandidateContactLocationForm } from './CandidateContactLocationForm';
import { CandidateSocialLinksLanguagesForm } from './CandidateSocialLinksLanguagesForm';
import { CandidatePreferencesForm } from './CandidatePreferencesForm';
import { IdentityPreviewCard } from './IdentityPreviewCard';
import { RealtimeCompletionBadge } from './RealtimeCompletionBadge';
import { CheckCircle2, Lock, Save, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

export const CandidateIdentityWorkspaceContent: React.FC = () => {
  const {
    saveStatus,
    lastSavedAt,
    serverError,
    privacy,
    updatePrivacyState,
    saveWorkspace,
  } = useIdentityWorkspace();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveWorkspace();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Autosave / Manual Save Status */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Candidate Identity & Contact Workspace</h2>
          <p className="text-xs text-slate-300 mt-1">
            Build your baseline candidate intelligence profile. Every edit updates your recruiter live preview instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right text-xs">
            {saveStatus === 'saving' && <span className="text-amber-400 font-bold animate-pulse">Saving changes...</span>}
            {saveStatus === 'saved' && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Changes Saved
              </span>
            )}
            {saveStatus === 'error' && <span className="text-rose-400 font-bold">Failed to Save</span>}
            {lastSavedAt && <p className="text-[10px] text-slate-400">Last saved: {lastSavedAt.toLocaleTimeString()}</p>}
          </div>

          <Button
            onClick={handleSave}
            isLoading={saveStatus === 'saving'}
            className="px-5 h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>Save Workspace</span>
          </Button>
        </div>
      </div>

      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Grid: Form Sections (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RealtimeCompletionBadge />
          <AvatarUploadCrop />
          <CandidateHeadlineBioForm />
          <CandidateContactLocationForm />
          <CandidateSocialLinksLanguagesForm />
          <CandidatePreferencesForm />

          {/* Privacy & Visibility Settings Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Privacy & Candidate Visibility Center</span>
            </h3>

            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.isPublic}
                  onChange={(e) => updatePrivacyState({ isPublic: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">
                  Public Profile (Visible to verified recruiters & search engines)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.isAnonymous}
                  onChange={(e) => updatePrivacyState({ isAnonymous: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">
                  Anonymous Mode (Hide name & direct contact info until application is accepted)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showContactInfo}
                  onChange={(e) => updatePrivacyState({ showContactInfo: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Display Phone & Location publicly</span>
              </label>
            </div>
          </div>
        </div>

        {/* Centerpiece Recruiter Live Preview */}
        <div className="lg:col-span-1">
          <IdentityPreviewCard />
        </div>
      </div>
    </div>
  );
};
