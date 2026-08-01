import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  CandidateProfile,
  CandidateSocialLink,
  CandidateLanguage,
  CandidatePreferences,
  CandidatePrivacyValues,
  CandidateCompletionState,
} from '../types/candidate.types';
import { candidateService } from '../lib/services/candidateService';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ProfileQualityMetrics {
  completionScore: number;
  qualityScore: number;
  atsReadinessScore: number;
  recruiterAppealScore: number;
  headlineRating: 'Excellent' | 'Good' | 'Needs Improvement';
  headlineSuggestion?: string;
  missingSections: string[];
}

export type PreviewMode = 'Employer View' | 'ATS View' | 'Public Profile' | 'Anonymous Profile';

interface IdentityWorkspaceContextType {
  candidateId: string;
  loading: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  serverError: string | null;
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  
  // Workspace Core State
  profile: Partial<CandidateProfile>;
  socialLinks: CandidateSocialLink[];
  languages: CandidateLanguage[];
  preferences: Partial<CandidatePreferences>;
  privacy: CandidatePrivacyValues;

  // Real-time Multi-Dimensional Quality State
  completion: CandidateCompletionState;
  qualityMetrics: ProfileQualityMetrics;

  // Actions
  updateProfileState: (updates: Partial<CandidateProfile>) => void;
  updateSocialLinksState: (links: CandidateSocialLink[]) => void;
  updateLanguagesState: (langs: CandidateLanguage[]) => void;
  updatePreferencesState: (prefs: Partial<CandidatePreferences>) => void;
  updatePrivacyState: (privacy: Partial<CandidatePrivacyValues>) => void;
  uploadAvatarFile: (file: File) => Promise<string | null>;
  saveWorkspace: () => Promise<boolean>;
}

const IdentityWorkspaceContext = createContext<IdentityWorkspaceContextType | undefined>(undefined);

export const IdentityWorkspaceProvider: React.FC<{ candidateId: string; children: React.ReactNode }> = ({
  candidateId,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [previewMode, setPreviewMode] = useState<PreviewMode>('Employer View');
  const [profile, setProfile] = useState<Partial<CandidateProfile>>({});
  const [socialLinks, setSocialLinks] = useState<CandidateSocialLink[]>([]);
  const [languages, setLanguages] = useState<CandidateLanguage[]>([]);
  const [preferences, setPreferences] = useState<Partial<CandidatePreferences>>({});
  const [privacy, setPrivacy] = useState<CandidatePrivacyValues>({
    isPublic: true,
    isAnonymous: false,
    showContactInfo: true,
    showResume: true,
    showPortfolio: true,
  });

  // Calculate Quality & Multi-Dimensional Metrics
  const qualityMetrics = useMemo<ProfileQualityMetrics>(() => {
    let compScore = 0;
    let qualScore = 40;
    const missing: string[] = [];

    if (profile.avatar_url) compScore += 20;
    else missing.push('Add Profile Photo');

    let headlineRating: 'Excellent' | 'Good' | 'Needs Improvement' = 'Needs Improvement';
    let headlineSuggestion: string | undefined = undefined;

    if (profile.headline && profile.headline.trim().length >= 10) {
      compScore += 20;
      if (profile.headline.includes('|') || profile.headline.length > 25) {
        headlineRating = 'Excellent';
        qualScore += 25;
      } else {
        headlineRating = 'Good';
        headlineSuggestion = 'Include key technical skills or years of experience in headline (e.g. "Senior React Dev | 7 Yrs Exp")';
        qualScore += 15;
      }
    } else {
      headlineSuggestion = 'Headline is too brief. Specify your target role and primary domain skills.';
      missing.push('Professional Headline');
    }

    if (profile.bio && profile.bio.trim().length >= 50) {
      compScore += 20;
      qualScore += 20;
    } else {
      missing.push('Complete About Me Summary');
    }

    if (profile.location && profile.phone) compScore += 15;
    else missing.push('Add Location & Contact Info');

    if (socialLinks.length > 0) compScore += 15;
    else missing.push('Add LinkedIn / GitHub Link');

    if (languages.length > 0) compScore += 10;
    else missing.push('Add Spoken Languages');

    const atsReadiness = Math.min(100, Math.round(compScore * 0.7 + qualScore * 0.3));
    const recruiterAppeal = Math.min(100, Math.round(compScore * 0.5 + qualScore * 0.5));

    return {
      completionScore: Math.min(100, compScore),
      qualityScore: Math.min(100, qualScore),
      atsReadinessScore: atsReadiness,
      recruiterAppealScore: recruiterAppeal,
      headlineRating,
      headlineSuggestion,
      missingSections: missing,
    };
  }, [profile, socialLinks, languages]);

  // Calculate real-time completion state
  const completion = useMemo<CandidateCompletionState>(() => {
    return {
      candidate_id: candidateId,
      overall_readiness_score: qualityMetrics.completionScore,
      identity_score: qualityMetrics.completionScore,
      experience_score: 0,
      education_score: 0,
      skills_score: 0,
      portfolio_score: 0,
      resume_score: 0,
      missing_sections: qualityMetrics.missingSections,
    };
  }, [candidateId, qualityMetrics]);

  // Initial Data Fetch
  useEffect(() => {
    if (!candidateId) return;

    const fetchInitialData = async () => {
      setLoading(true);
      setServerError(null);

      try {
        const res = await candidateService.getCandidateProfile(candidateId);
        if (res.data) {
          setProfile(res.data);
        }

        const privRes = await candidateService.getPrivacySettings(candidateId);
        if (privRes.data) {
          setPrivacy(privRes.data);
        }
      } catch {
        setServerError('Failed to load candidate workspace.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [candidateId]);

  const updateProfileState = useCallback((updates: Partial<CandidateProfile>) => {
    setProfile((prev: Partial<CandidateProfile>) => ({ ...prev, ...updates }));
    setSaveStatus('idle');
  }, []);

  const updateSocialLinksState = useCallback((links: CandidateSocialLink[]) => {
    setSocialLinks(links);
    setSaveStatus('idle');
  }, []);

  const updateLanguagesState = useCallback((langs: CandidateLanguage[]) => {
    setLanguages(langs);
    setSaveStatus('idle');
  }, []);

  const updatePreferencesState = useCallback((prefs: Partial<CandidatePreferences>) => {
    setPreferences((prev: Partial<CandidatePreferences>) => ({ ...prev, ...prefs }));
    setSaveStatus('idle');
  }, []);

  const updatePrivacyState = useCallback((updates: Partial<CandidatePrivacyValues>) => {
    setPrivacy((prev: CandidatePrivacyValues) => ({ ...prev, ...updates }));
    setSaveStatus('idle');
  }, []);

  const uploadAvatarFile = useCallback(
    async (file: File): Promise<string | null> => {
      setSaveStatus('saving');
      const url = await candidateService.uploadAvatar(candidateId, file);
      if (url) {
        setProfile((prev: Partial<CandidateProfile>) => ({ ...prev, avatar_url: url }));
        setSaveStatus('saved');
        setLastSavedAt(new Date());
        return url;
      } else {
        setSaveStatus('error');
        setServerError('Failed to upload avatar.');
        return null;
      }
    },
    [candidateId]
  );


  const saveWorkspace = useCallback(async (): Promise<boolean> => {
    if (!candidateId) return false;
    setSaveStatus('saving');
    setServerError(null);

    try {
      // Persist profile
      await candidateService.updateProfile(candidateId, {
        headline: profile.headline,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
        work_authorization: profile.work_authorization,
        avatar_url: profile.avatar_url,
      });

      // Persist privacy
      await candidateService.updatePrivacySettings(candidateId, privacy);

      setSaveStatus('saved');
      setLastSavedAt(new Date());
      return true;
    } catch (err: any) {
      setSaveStatus('error');
      setServerError(err.message || 'Failed to save identity workspace.');
      return false;
    }
  }, [candidateId, profile, privacy]);

  return (
    <IdentityWorkspaceContext.Provider
      value={{
        candidateId,
        loading,
        saveStatus,
        lastSavedAt,
        serverError,
        previewMode,
        setPreviewMode,
        profile,
        socialLinks,
        languages,
        preferences,
        privacy,
        completion,
        qualityMetrics,
        updateProfileState,
        updateSocialLinksState,
        updateLanguagesState,
        updatePreferencesState,
        updatePrivacyState,
        uploadAvatarFile,
        saveWorkspace,
      }}
    >
      {children}
    </IdentityWorkspaceContext.Provider>
  );
};

export const useIdentityWorkspace = () => {
  const context = useContext(IdentityWorkspaceContext);
  if (!context) {
    throw new Error('useIdentityWorkspace must be used within an IdentityWorkspaceProvider');
  }
  return context;
};
