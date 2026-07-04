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
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight">
            Skills Management
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Maintain your inventory of technical competencies, years of experience, and proficiency levels.
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
