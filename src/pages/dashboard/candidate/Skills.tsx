import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { candidateService } from '../../../lib/services/candidateService';
import type { CandidateSkill } from '../../../lib/services/candidateService';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Loading } from '../../../components/ui/Loading';
import { SkillBadgeSelector } from '../../../components/dashboard/SkillBadgeSelector';
import { Award, Layers } from 'lucide-react';

export const Skills: React.FC = () => {
  const { profile } = useAuth();
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = async () => {
    if (!profile) return;
    try {
      const data = await candidateService.getSkills(profile.id);
      setSkills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [profile]);

  if (loading) {
    return <Loading label="Loading skills inventory..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 bg-[#F9FAFB] dark:bg-slate-950 min-h-screen p-2 sm:p-6 font-sans text-slate-900 dark:text-slate-100 transition-colors animate-fade-in">
      {/* Executive Header Block */}
      <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Skill Competency Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage your verified technical stack competencies and years of experience.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Skills Form and Selector */}
        <div className="lg:col-span-2">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" /> Technical Capabilities Registry
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile && (
                <SkillBadgeSelector
                  candidateId={profile.id}
                  skills={skills}
                  onSkillsChange={fetchSkills}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Skill Vetting Info Widget */}
        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-secondary" /> Credential Matching
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-500 leading-relaxed space-y-3">
              <p>
                Our talent matching algorithms check each skill name and experience rating against employer requests.
              </p>
              <div className="bg-blue-50 border border-blue-150 border-solid rounded-lg p-3 text-blue-900 font-medium">
                Tip: Keeping years of experience updated ensures maximum match scores on automated searches.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
