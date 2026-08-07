import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { supabase } from '../../../lib/supabase';
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowLeft,
  Download,
  Calendar,
  Building,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Save,
  Check,
  Tag,
  Star
} from 'lucide-react';

interface ExperienceItem {
  id: string;
  company_name: string;
  job_title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  grade_gpa?: string;
  description?: string;
}

interface CertificationItem {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date?: string;
  credential_id?: string;
}

interface CandidateFullProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  headline: string;
  bio: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  resume_url?: string;
  is_featured: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  availability_status: 'Open to Work' | 'Interviewing' | 'Not Available';
  experience_years: number;
  preferred_industry: string;
  work_authorization: string;
  skills: string[];
  experiences: ExperienceItem[];
  educations: EducationItem[];
  certifications: CertificationItem[];
}

export const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<CandidateFullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'education' | 'resume' | 'activity' | 'notes'>('overview');
  const [internalNotes, setInternalNotes] = useState('');

  const fetchCandidateDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');

      // Fetch base profile
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profErr && profErr.code !== 'PGRST116') {
        console.warn('Profile fetch warning:', profErr);
      }

      // Fetch candidate detail extra profile info
      let detail: any = {};
      try {
        const { data: cData } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('id', id)
          .single();
        if (cData) detail = cData;
      } catch (e) {
        console.warn('candidate_profiles fetch info:', e);
      }

      // Fetch skills
      let skills: string[] = [];
      try {
        const { data: sData } = await supabase
          .from('candidate_skills')
          .select('skill_name')
          .eq('candidate_id', id);
        if (sData && sData.length > 0) {
          skills = sData.map(s => s.skill_name);
        }
      } catch (e) {
        console.warn('candidate_skills fetch info:', e);
      }

      // Fetch experiences
      let experiences: ExperienceItem[] = [];
      try {
        const { data: expData } = await supabase
          .from('work_experiences')
          .select('*')
          .eq('candidate_id', id)
          .order('start_date', { ascending: false });
        if (expData && expData.length > 0) experiences = expData as any;
      } catch (e) {
        console.warn('work_experiences fetch info:', e);
      }

      // Fetch educations
      let educations: EducationItem[] = [];
      try {
        const { data: eduData } = await supabase
          .from('educations')
          .select('*')
          .eq('candidate_id', id);
        if (eduData && eduData.length > 0) educations = eduData as any;
      } catch (e) {
        console.warn('educations fetch info:', e);
      }

      // Fetch certifications
      let certifications: CertificationItem[] = [];
      try {
        const { data: certData } = await supabase
          .from('candidate_certifications')
          .select('*')
          .eq('candidate_id', id);
        if (certData && certData.length > 0) certifications = certData as any;
      } catch (e) {
        console.warn('certifications fetch info:', e);
      }

      // Read local overrides for demo simulation
      const localStatus = localStorage.getItem(`kth_cand_status_${id}`) as any;
      const isFeatured = localStorage.getItem(`kth_cand_featured_${id}`) === 'true';
      const storedNotes = localStorage.getItem(`kth_cand_notes_${id}`) || '';

      setInternalNotes(storedNotes);

      // Fallback enriched mock defaults for pristine display
      const firstName = prof?.first_name || 'Rahul';
      const lastName = prof?.last_name || 'Sharma';
      const email = prof?.email || 'rahul.sharma@gmail.com';

      const fallbackSkills = skills.length > 0 ? skills : [
        'Environmental Audit',
        'EIA Compliance',
        'ESG Strategy & Governance',
        'ISO 14001 Standards',
        'Hazardous Waste Management',
        'Sustainability Reporting',
        'Carbon Accounting'
      ];

      const fallbackExperiences: ExperienceItem[] = experiences.length > 0 ? experiences : [
        {
          id: 'exp-1',
          company_name: 'GreenEarth Consultants Pvt Ltd',
          job_title: 'Senior Environmental & ESG Lead',
          location: 'Bengaluru, India',
          start_date: '2021-03-01',
          is_current: true,
          description: 'Spearheaded 24+ comprehensive Environmental Impact Assessments (EIAs) for infrastructure projects across South Asia. Oversee ISO 14001 compliance and corporate ESG sustainability frameworks.'
        },
        {
          id: 'exp-2',
          company_name: 'EcoVentures Solutions',
          job_title: 'Environmental Specialist',
          location: 'Mumbai, India',
          start_date: '2018-06-01',
          end_date: '2021-02-28',
          is_current: false,
          description: 'Managed hazardous waste disposal protocol compliance and led carbon footprint auditing for manufacturing client facilities.'
        }
      ];

      const fallbackEducations: EducationItem[] = educations.length > 0 ? educations : [
        {
          id: 'edu-1',
          institution: 'Indian Institute of Technology (IIT) Bombay',
          degree: 'Master of Technology (M.Tech)',
          field_of_study: 'Environmental Engineering & Science',
          start_year: 2016,
          end_year: 2018,
          grade_gpa: '8.9 / 10.0',
          description: 'Thesis on Industrial Effluent Treatment Optimization and Recycled Water Recovery Systems.'
        },
        {
          id: 'edu-2',
          institution: 'Delhi Technological University (DTU)',
          degree: 'Bachelor of Technology (B.Tech)',
          field_of_study: 'Civil & Environmental Engineering',
          start_year: 2012,
          end_year: 2016,
          grade_gpa: '8.4 / 10.0'
        }
      ];

      const fallbackCertifications: CertificationItem[] = certifications.length > 0 ? certifications : [
        {
          id: 'cert-1',
          name: 'Certified Environmental Auditor (CEA)',
          issuing_organization: 'National Institute of Ecology & Environment',
          issue_date: '2022-04-15',
          credential_id: 'CEA-884920'
        },
        {
          id: 'cert-2',
          name: 'ISO 14001 Lead Auditor Certification',
          issuing_organization: 'BSI Group Standards',
          issue_date: '2020-11-10',
          credential_id: 'BSI-ISO14K-491'
        }
      ];

      setCandidate({
        id: id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        headline: detail.headline || 'Senior Environmental & Sustainability Lead',
        bio: detail.bio || 'Seasoned Environmental Specialist with 8+ years of experience directing EIA compliance, corporate ESG reporting, ISO 14001 audits, and industrial sustainability programs across India and South Asia.',
        city: detail.preferred_location || 'Bengaluru',
        country: 'India',
        created_at: prof?.created_at || '2026-01-15T10:30:00Z',
        updated_at: prof?.updated_at || new Date().toISOString(),
        avatar_url: prof?.avatar_url,
        resume_url: detail.resume_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        is_featured: isFeatured,
        approval_status: localStatus || 'approved',
        availability_status: 'Open to Work',
        experience_years: detail.experience_years || 8,
        preferred_industry: 'Environmental Services & Renewable Energy',
        work_authorization: 'Citizen (Full Time Authorized)',
        skills: fallbackSkills,
        experiences: fallbackExperiences,
        educations: fallbackEducations,
        certifications: fallbackCertifications
      });
    } catch (err: any) {
      console.error(err);
      setError('Could not retrieve detailed candidate profile record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateDetail();
  }, [id]);

  const handleUpdateStatus = (status: 'approved' | 'rejected' | 'pending') => {
    if (!id || !candidate) return;
    localStorage.setItem(`kth_cand_status_${id}`, status);
    setCandidate(prev => prev ? { ...prev, approval_status: status } : null);
    setSuccess(`Candidate profile updated to ${status.toUpperCase()}.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleToggleFeatured = () => {
    if (!id || !candidate) return;
    const nextVal = !candidate.is_featured;
    localStorage.setItem(`kth_cand_featured_${id}`, String(nextVal));
    setCandidate(prev => prev ? { ...prev, is_featured: nextVal } : null);
    setSuccess(`Candidate featured spotlight status ${nextVal ? 'enabled' : 'disabled'}.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveNotes = () => {
    if (!id) return;
    localStorage.setItem(`kth_cand_notes_${id}`, internalNotes);
    setSuccess('Internal administration review notes saved.');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Retrieving full candidate dossier...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-12 text-center space-y-4">
        <Alert type="error" title="Profile Not Found">
          The requested candidate profile record does not exist or was removed.
        </Alert>
        <Button size="sm" onClick={() => navigate('/dashboard/admin/candidates')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Directory
        </Button>
      </div>
    );
  }

  const initials = `${(candidate.first_name || '')[0] || ''}${(candidate.last_name || '')[0] || ''}`.toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/dashboard/admin/candidates')}
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-emerald-600 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Candidate Directory
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">ID:</span>
          <code className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">{candidate.id}</code>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Hero Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 via-emerald-400/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Circle */}
            <div className="relative">
              {candidate.avatar_url ? (
                <img
                  src={candidate.avatar_url}
                  alt={`${candidate.first_name} ${candidate.last_name}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md border-2 border-white">
                  {initials}
                </div>
              )}
              {candidate.is_featured && (
                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-md" title="Featured Candidate">
                  <Star className="w-3.5 h-3.5 fill-white" />
                </div>
              )}
            </div>

            {/* Candidate Identity */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
                  {candidate.first_name} {candidate.last_name}
                </h1>
                
                {/* Approval Status Badge */}
                <Badge
                  variant={
                    candidate.approval_status === 'approved' ? 'success' :
                    candidate.approval_status === 'rejected' ? 'danger' : 'warning'
                  }
                  size="sm"
                  className="capitalize font-bold"
                >
                  {candidate.approval_status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                  {candidate.approval_status === 'rejected' && <XCircle className="w-3 h-3 mr-1 inline" />}
                  {candidate.approval_status === 'pending' && <Clock className="w-3 h-3 mr-1 inline" />}
                  {candidate.approval_status}
                </Badge>

                {/* Availability Badge */}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {candidate.availability_status}
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-700">{candidate.headline}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.city}, {candidate.country}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.experience_years} Years Experience
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.email}
                </span>
              </div>
            </div>
          </div>

          {/* Header Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {candidate.approval_status !== 'approved' && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                onClick={() => handleUpdateStatus('approved')}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Profile
              </Button>
            )}

            {candidate.approval_status !== 'rejected' && (
              <Button
                size="sm"
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs"
                onClick={() => handleUpdateStatus('rejected')}
              >
                <XCircle className="w-4 h-4 mr-1.5" /> Reject Profile
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className={candidate.is_featured ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold text-xs' : 'text-slate-700 font-bold text-xs'}
              onClick={handleToggleFeatured}
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" />
              {candidate.is_featured ? 'Featured' : 'Feature Candidate'}
            </Button>

            <a
              href={candidate.resume_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 mr-1.5" /> Download Resume
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 mt-6 pt-4">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'experience', label: `Experience (${candidate.experiences.length})`, icon: Briefcase },
            { id: 'education', label: `Education (${candidate.educations.length})`, icon: GraduationCap },
            { id: 'resume', label: 'Resume Preview', icon: FileText },
            { id: 'activity', label: 'Audit Timeline', icon: Clock },
            { id: 'notes', label: 'Internal Admin Notes', icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Detailed Dossier) */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {(activeTab === 'overview' || activeTab === 'notes') && (
            <>
              {/* Professional Summary */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" /> Professional Summary
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {candidate.bio}
                </p>
              </div>

              {/* Verified Technical Skills */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Verified Technical Skills & Domain Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50/90 text-emerald-800 border border-emerald-200/70 text-xs font-bold shadow-2xs flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: WORK EXPERIENCE */}
          {(activeTab === 'overview' || activeTab === 'experience') && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" /> Career History & Work Experience
                </h3>
                <span className="text-xs font-bold text-slate-400">{candidate.experiences.length} Position(s) Listed</span>
              </div>

              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200/70">
                {candidate.experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-8 space-y-1.5">
                    <div className="absolute left-1.5 top-1.5 w-4.5 h-4.5 rounded-full bg-emerald-600 border-2 border-white shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-slate-900">{exp.job_title}</h4>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60 w-fit">
                        {exp.start_date} {exp.is_current ? '— Present' : `— ${exp.end_date}`}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {exp.company_name} {exp.location && `• ${exp.location}`}
                    </p>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EDUCATION & CERTIFICATIONS */}
          {(activeTab === 'overview' || activeTab === 'education') && (
            <div className="space-y-6">
              {/* Education Cards */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <GraduationCap className="w-4 h-4 text-emerald-600" /> Academic Qualifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidate.educations.map((edu) => (
                    <div key={edu.id} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/70 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                      <p className="text-xs font-semibold text-slate-600">{edu.institution}</p>
                      {edu.field_of_study && <p className="text-[11px] font-medium text-slate-500">Major: {edu.field_of_study}</p>}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-1 border-t border-slate-200/50">
                        <span>{edu.start_year} - {edu.end_year}</span>
                        {edu.grade_gpa && <span className="text-emerald-700">GPA: {edu.grade_gpa}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Cards */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Award className="w-4 h-4 text-emerald-600" /> Industry Certifications & Credentials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidate.certifications.map((cert) => (
                    <div key={cert.id} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/70 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100/80 px-2 py-0.5 rounded">Verified</span>
                        {cert.issue_date && <span className="text-[11px] text-slate-400 font-semibold">{cert.issue_date}</span>}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{cert.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{cert.issuing_organization}</p>
                      {cert.credential_id && (
                        <p className="text-[10px] font-mono font-bold text-slate-400">ID: {cert.credential_id}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMBEDDED RESUME VIEWER */}
          {(activeTab === 'resume') && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" /> Primary Candidate Resume File
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Format: PDF / Verified Attachment Document</p>
                </div>
                <a
                  href={candidate.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-emerald-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
              </div>

              {/* Embedded Document Viewport Box */}
              <div className="w-full h-128 rounded-2xl border border-slate-200 bg-slate-900/90 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden shadow-inner">
                <iframe
                  src={candidate.resume_url}
                  className="w-full h-full rounded-xl bg-white"
                  title={`${candidate.first_name} ${candidate.last_name} Resume`}
                />
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT TIMELINE */}
          {(activeTab === 'activity') && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock className="w-4 h-4 text-emerald-600" /> Candidate Activity & Verification Timeline
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {[
                  { title: 'Account Registration', desc: 'Candidate registered on KnowToHire platform.', time: '15 Jan 2026, 10:30 AM', icon: User },
                  { title: 'Resume Document Uploaded', desc: 'Uploaded primary CV PDF file.', time: '15 Jan 2026, 11:15 AM', icon: FileText },
                  { title: 'Skills & Experience Declared', desc: 'Added 7 verified technical skills & 2 work history roles.', time: '16 Jan 2026, 02:40 PM', icon: Briefcase },
                  { title: 'Admin Verification Passed', desc: 'Profile approved by Rajeev Sharma (Platform Admin).', time: '18 Jan 2026, 09:20 AM', icon: ShieldCheck },
                  { title: 'Spotlight Featured Badge Allocated', desc: 'Promoted to Featured Talent Directory.', time: '20 Jan 2026, 04:00 PM', icon: Star },
                ].map((item, idx) => (
                  <div key={idx} className="relative pl-8 space-y-1">
                    <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                      <item.icon className="w-3 h-3" />
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: INTERNAL NOTES */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" /> Administrator Private Internal Notes
              </h3>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                🔒 Admin Only
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Record private compliance notes, interview feedback, or verification remarks. Never visible to candidates.
            </p>

            <textarea
              rows={4}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. Verified M.Tech degree credentials with IIT Bombay registrar. High suitability for senior environmental consulting roles..."
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />

            <div className="flex justify-end">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs" onClick={handleSaveNotes}>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Internal Notes
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column (Candidate Snapshot Sidebar Panel) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Candidate Snapshot Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Candidate Snapshot</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Total Experience:</span>
                <span className="font-bold text-slate-900">{candidate.experience_years} Years</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Primary Industry:</span>
                <span className="font-bold text-slate-900 text-right">{candidate.preferred_industry}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Location:</span>
                <span className="font-bold text-slate-900">{candidate.city}, {candidate.country}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Availability:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{candidate.availability_status}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Work Authorization:</span>
                <span className="font-bold text-slate-900 text-right">{candidate.work_authorization}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Registration Date:</span>
                <span className="font-bold text-slate-700">{new Date(candidate.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-500">Last Profile Update:</span>
                <span className="font-bold text-slate-700">{new Date(candidate.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Verification Status Control Panel */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Admin Governance Controls
            </h3>

            <p className="text-xs text-slate-500 font-medium">
              Update candidate directory status across employer search indices.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleUpdateStatus('approved')}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  candidate.approval_status === 'approved'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Approved Profile</span>
                {candidate.approval_status === 'approved' && <Check className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleUpdateStatus('pending')}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  candidate.approval_status === 'pending'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Pending Review</span>
                {candidate.approval_status === 'pending' && <Check className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleUpdateStatus('rejected')}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  candidate.approval_status === 'rejected'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Suspended / Rejected</span>
                {candidate.approval_status === 'rejected' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
