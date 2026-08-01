import React from 'react';
import { useCareerEvidence } from '../../../context/CareerEvidenceContext';
import { TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

export const InteractiveCareerTimelinePreview: React.FC = () => {
  const { experiences, educationList, certifications, progressionInsight } = useCareerEvidence();

  // Combine & sort all evidence items chronologically
  const timelineEvents = [
    ...experiences.map((exp) => ({
      type: 'experience' as const,
      date: exp.start_date,
      title: exp.role_title,
      subtitle: exp.company_name,
      location: exp.location,
      badge: exp.is_current ? 'Current Role' : exp.employment_type || 'Full-time',
      skills: exp.skills_used || [],
      achievements: exp.achievements || [],
    })),
    ...educationList.map((edu) => ({
      type: 'education' as const,
      date: edu.start_date,
      title: edu.degree,
      subtitle: edu.institution,
      location: edu.field_of_study,
      badge: edu.grade_gpa ? `GPA: ${edu.grade_gpa}` : 'Degree',
      skills: edu.skills_demonstrated || [],
      achievements: edu.honors || [],
    })),
    ...certifications.map((cert) => ({
      type: 'certification' as const,
      date: cert.issue_date,
      title: cert.name,
      subtitle: cert.issuing_organization,
      location: cert.credential_id || 'Verified',
      badge: cert.status || 'Active',
      skills: cert.skills_covered || [],
      achievements: [],
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6 sticky top-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Career Trajectory Story</span>
        </div>
        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
          {progressionInsight.careerTrajectory}
        </span>
      </div>

      {/* Progression Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 block uppercase">Total Experience</span>
          <span className="text-sm font-extrabold text-white">{progressionInsight.totalYearsExperience} Yrs</span>
        </div>
        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 block uppercase">Promotions</span>
          <span className="text-sm font-extrabold text-emerald-400">{progressionInsight.promotionCount}</span>
        </div>
        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 block uppercase">Career Gaps</span>
          <span className="text-sm font-extrabold text-amber-400">{progressionInsight.gapCount}</span>
        </div>
      </div>

      {/* Career Gap Insights */}
      {progressionInsight.gapDetails.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>AI Career Continuity Note</span>
          </div>
          {progressionInsight.gapDetails.map((gap, idx) => (
            <p key={idx} className="text-[11px] text-amber-200/90 pl-5">• {gap}</p>
          ))}
        </div>
      )}

      {/* Interactive Visual Timeline */}
      <div className="space-y-4 pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visual Career Progression</span>

        {timelineEvents.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">No evidence items added yet. Use the editors to build your story.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Point Node */}
                <span className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 bg-slate-900 flex items-center justify-center ${
                  event.type === 'experience'
                    ? 'border-emerald-500 text-emerald-400'
                    : event.type === 'education'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-purple-500 text-purple-400'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                </span>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{event.title}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-medium rounded-md">
                      {event.badge}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-400 font-semibold">{event.subtitle}</p>
                  <p className="text-[11px] text-slate-400">{event.date} • {event.location}</p>

                  {/* Skills Graph Chips */}
                  {event.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {event.skills.map((sk, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-medium rounded-md">
                          {sk.skill_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Extracted Skills Graph */}
      {progressionInsight.topSkillsUsed.length > 0 && (
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Top Demonstrated Skills Graph
          </span>
          <div className="flex flex-wrap gap-1.5">
            {progressionInsight.topSkillsUsed.map((skill, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
