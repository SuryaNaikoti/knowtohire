import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { candidateService } from '../../lib/services/candidateService';
import { projectsService } from '../../lib/services/projectsService';
import type { CandidateProfile, CandidateSkill, CandidateExperience, CandidateEducation, CandidateCertification } from '../../lib/services/candidateService';
import type { CandidateProject } from '../../lib/services/projectsService';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { MapPin, Briefcase, Calendar, Award, FolderGit2, BookOpen, Download, Globe, Mail, ArrowLeft } from 'lucide-react';

export const PublicProfile: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [experience, setExperience] = useState<CandidateExperience[]>([]);
  const [education, setEducation] = useState<CandidateEducation[]>([]);
  const [certs, setCerts] = useState<CandidateCertification[]>([]);
  const [projects, setProjects] = useState<CandidateProject[]>([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!candidateId) return;
      try {
        setLoading(true);
        const [profileData, skillsData, expData, eduData, certsData, projectsData] = await Promise.all([
          candidateService.getProfile(candidateId),
          candidateService.getSkills(candidateId),
          candidateService.getExperience(candidateId),
          candidateService.getEducation(candidateId),
          candidateService.getCertifications(candidateId),
          projectsService.getProjects(candidateId),
        ]);

        setProfile(profileData);
        setSkills(skillsData);
        setExperience(expData);
        setEducation(eduData);
        setCerts(certsData);
        setProjects(projectsData);
      } catch (err) {
        console.error('Failed to load public profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [candidateId]);

  if (loading) return <Loading label="Loading candidate profile..." />;

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-sm text-slate-500">The profile you are looking for does not exist or has been set to private.</p>
        <Link to="/">
          <Button variant="primary">Go Home</Button>
        </Link>
      </div>
    );
  }

  // Get full name from profile, otherwise mock it if not available
  const fullName = profile.profiles ? `${profile.profiles.first_name || ''} ${profile.profiles.last_name || ''}`.trim() : 'Candidate Profile';
  const email = profile.profiles?.email || '';

  return (
    <div className="bg-slate-50/40 min-h-screen py-12 animate-fade-in-up">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Back navigation */}
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Jobs Feed
        </Link>

        {/* Hero Card */}
        <Card className="bg-white border border-slate-200 overflow-hidden rounded-[24px] shadow-sm">
          <div className="h-32 bg-gradient-to-r from-primary to-indigo-700 relative" />
          <CardContent className="p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-20 sm:-mt-24 mb-6">
              <img
                src={profile.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.profiles?.first_name || 'User'}`}
                alt={fullName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white shadow-md shrink-0 object-cover"
              />
              {profile.resume_url && (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full text-xs font-bold flex items-center justify-center gap-1.5">
                    <Download className="w-4 h-4" /> Download Resume
                  </Button>
                </a>
              )}
            </div>

            <div className="space-y-4 text-left">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight leading-tight">
                  {fullName}
                </h1>
                {profile.headline && (
                  <p className="text-sm font-bold text-gray-700 mt-1">{profile.headline}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold mt-2.5">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" /> {profile.location}
                    </span>
                  )}
                  {email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4 text-slate-400" /> {email}
                    </span>
                  )}
                </div>
              </div>

              {profile.bio && (
                <div className="border-t border-slate-100 pt-4">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">About Me</h2>
                  <p className="text-sm text-slate-650 font-normal leading-relaxed whitespace-pre-line">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Sidebar components: Skills */}
          <div className="space-y-6">
            <Card className="bg-white border border-slate-200 p-6 rounded-2xl">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary" /> Technical Skills
              </h2>
              {skills.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">No skills added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary" size="md">
                      {skill.skill_name}
                      {skill.proficiency_level && (
                        <span className="opacity-60 font-medium ml-1">({skill.proficiency_level})</span>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Main content area: Exp, Edu, Certs, Projects */}
          <div className="md:col-span-2 space-y-8">
            {/* Work Experience */}
            <Card className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[24px]">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary" /> Work Experience
              </h2>
              {experience.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">No work experience listed.</p>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-slate-100">
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative pl-8">
                      <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-primary border-2 border-white ring-2 ring-blue-50" />
                      <div className="space-y-1">
                        <h3 className="font-heading font-black text-slate-900 text-sm leading-tight">{exp.role}</h3>
                        <p className="text-xs font-bold text-gray-700">{exp.company_name} • {exp.location || 'Remote'}</p>
                        <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                          {exp.is_current
                            ? 'Present'
                            : exp.end_date
                            ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : ''}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-slate-600 font-normal leading-relaxed mt-2 whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Education History */}
            <Card className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[24px]">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" /> Education History
              </h2>
              {education.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">No education listed.</p>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-slate-100">
                  {education.map((edu) => (
                    <div key={edu.id} className="relative pl-8">
                      <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-50" />
                      <div className="space-y-1">
                        <h3 className="font-heading font-black text-slate-900 text-sm leading-tight">{edu.degree} in {edu.field_of_study}</h3>
                        <p className="text-xs font-bold text-gray-700">{edu.institution_name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                          {edu.is_current
                            ? 'Present'
                            : edu.end_date
                            ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Certifications */}
            {certs.length > 0 && (
              <Card className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[24px]">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" /> Certifications & Credentials
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certs.map((cert) => (
                    <div key={cert.id} className="p-4 border border-slate-100 border-solid rounded-xl bg-slate-50/30 flex items-start gap-3">
                      <Award className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-xs truncate leading-snug">{cert.name}</h3>
                        <p className="text-[10px] text-slate-500 font-semibold leading-tight truncate">{cert.issuing_organization}</p>
                        {cert.issue_date && (
                          <p className="text-[9px] text-slate-400 font-bold">
                            Issued: {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        )}
                        {cert.credential_url && (
                          <a
                            href={cert.credential_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-bold mt-1"
                          >
                            Verify Credential
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Portfolio Projects */}
            {projects.length > 0 && (
              <Card className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[24px]">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-primary" /> Projects & Portfolio
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <div key={proj.id} className={`p-4 border border-solid rounded-xl bg-white flex flex-col justify-between space-y-3 ${proj.is_featured ? 'border-amber-200 ring-1 ring-amber-50' : 'border-slate-100'}`}>
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 text-xs truncate">{proj.title}</h3>
                        {proj.description && (
                          <p className="text-[10px] text-slate-500 font-medium line-clamp-3 leading-relaxed">
                            {proj.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        {proj.project_url && (
                          <a
                            href={proj.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] text-primary hover:underline font-bold"
                          >
                            Live Demo
                          </a>
                        )}
                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] text-slate-500 hover:text-slate-900 hover:underline font-bold"
                          >
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;
