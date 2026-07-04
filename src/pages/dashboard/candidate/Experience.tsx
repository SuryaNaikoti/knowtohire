import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { candidateService } from '../../../lib/services/candidateService';
import type {
  CandidateExperience,
  CandidateEducation,
  CandidateCertification,
} from '../../../lib/services/candidateService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Loading } from '../../../components/ui/Loading';
import { ExperienceForm } from '../../../components/dashboard/ExperienceForm';
import { EducationForm } from '../../../components/dashboard/EducationForm';
import { CertificationForm } from '../../../components/dashboard/CertificationForm';
import { Briefcase, GraduationCap, Award, Plus, Calendar, MapPin, Trash2, Edit2 } from 'lucide-react';

export const Experience: React.FC = () => {
  const { profile } = useAuth();
  
  // Data State
  const [experience, setExperience] = useState<CandidateExperience[]>([]);
  const [education, setEducation] = useState<CandidateEducation[]>([]);
  const [certifications, setCertifications] = useState<CandidateCertification[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals Visibility
  const [isExpOpen, setIsExpOpen] = useState(false);
  const [isEduOpen, setIsEduOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);

  // Edit Records
  const [selectedExp, setSelectedExp] = useState<CandidateExperience | null>(null);
  const [selectedEdu, setSelectedEdu] = useState<CandidateEducation | null>(null);
  const [selectedCert, setSelectedCert] = useState<CandidateCertification | null>(null);

  const fetchData = async () => {
    if (!profile) return;
    try {
      const [expData, eduData, certData] = await Promise.all([
        candidateService.getExperience(profile.id),
        candidateService.getEducation(profile.id),
        candidateService.getCertifications(profile.id),
      ]);
      setExperience(expData);
      setEducation(eduData);
      setCertifications(certData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  // Handlers for Experience CRUD
  const handleEditExp = (exp: CandidateExperience) => {
    setSelectedExp(exp);
    setIsExpOpen(true);
  };
  
  const handleAddNewExp = () => {
    setSelectedExp(null);
    setIsExpOpen(true);
  };

  const handleDeleteExp = async (expId: string) => {
    if (!profile || !window.confirm('Are you sure you want to remove this experience record?')) return;
    try {
      await candidateService.deleteExperience(profile.id, expId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for Education CRUD
  const handleEditEdu = (edu: CandidateEducation) => {
    setSelectedEdu(edu);
    setIsEduOpen(true);
  };

  const handleAddNewEdu = () => {
    setSelectedEdu(null);
    setIsEduOpen(true);
  };

  const handleDeleteEdu = async (eduId: string) => {
    if (!profile || !window.confirm('Are you sure you want to remove this education record?')) return;
    try {
      await candidateService.deleteEducation(profile.id, eduId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for Certifications CRUD
  const handleEditCert = (cert: CandidateCertification) => {
    setSelectedCert(cert);
    setIsCertOpen(true);
  };

  const handleAddNewCert = () => {
    setSelectedCert(null);
    setIsCertOpen(true);
  };

  const handleDeleteCert = async (certId: string) => {
    if (!profile || !window.confirm('Are you sure you want to remove this certification?')) return;
    try {
      await candidateService.deleteCertification(profile.id, certId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  if (loading) {
    return <Loading label="Loading portfolio history..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight">
            Work Experience & Qualifications
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Add milestones regarding your career path, formal degrees, and industry credentials.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* ==========================================
            1. EXPERIENCE TIMELINE SECTION
            ========================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight flex items-center gap-1.5">
              <Briefcase className="w-5 h-5 text-primary" /> Work History
            </h2>
            <Button size="sm" onClick={handleAddNewExp} className="text-xs font-bold">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Job
            </Button>
          </div>

          <Card className="bg-white">
            <CardContent className="p-6">
              {experience.length === 0 ? (
                <p className="text-xs text-gray-400 font-bold text-center py-4">No work history registered.</p>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-gray-100 before:border-none">
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative pl-8 sm:pl-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                      {/* Timeline dot */}
                      <span className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-primary shadow-sm z-10" />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-black text-gray-900">{exp.role_title}</h4>
                          <span className="text-gray-300 hidden sm:inline">•</span>
                          <span className="text-xs font-bold text-gray-600">{exp.company_name}</span>
                          {exp.is_current && <Badge variant="secondary" size="sm">Current</Badge>}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(exp.start_date)} – {exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : ''}
                          </span>
                          {exp.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </span>
                          )}
                        </div>

                        {exp.description && (
                          <p className="text-xs text-gray-500 font-medium leading-relaxed pt-1.5 whitespace-pre-line max-w-2xl">
                            {exp.description}
                          </p>
                        )}
                      </div>

                      {/* Timeline controls */}
                      <div className="flex items-center space-x-1 self-start sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditExp(exp)}
                          className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                          aria-label="Edit job"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExp(exp.id)}
                          className="p-1 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-650 transition cursor-pointer"
                          aria-label="Delete job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ==========================================
            2. EDUCATION SECTION
            ========================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight flex items-center gap-1.5">
              <GraduationCap className="w-5 h-5 text-secondary" /> Education History
            </h2>
            <Button size="sm" onClick={handleAddNewEdu} className="text-xs font-bold">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Degree
            </Button>
          </div>

          <Card className="bg-white">
            <CardContent className="p-6">
              {education.length === 0 ? (
                <p className="text-xs text-gray-400 font-bold text-center py-4">No education records registered.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {education.map((edu) => (
                    <div
                      key={edu.id}
                      className="border border-gray-200 border-solid rounded-xl p-4 flex flex-col justify-between gap-3 shadow-xs hover:border-gray-300 transition-all group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide leading-tight">
                            {edu.degree}
                          </h4>
                          {/* controls */}
                          <div className="flex items-center space-x-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditEdu(edu)}
                              className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                              aria-label="Edit degree"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteEdu(edu.id)}
                              className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-650 cursor-pointer"
                              aria-label="Delete degree"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-primary">{edu.institution}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{edu.field_of_study}</p>
                        
                        <div className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(edu.start_date)} – {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                        </div>

                        {edu.description && (
                          <p className="text-[11px] text-gray-500 font-medium leading-relaxed pt-1.5 border-t border-gray-100 border-solid mt-2">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ==========================================
            3. CERTIFICATIONS SECTION
            ========================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight flex items-center gap-1.5">
              <Award className="w-5 h-5 text-accent" /> Certifications & Licenses
            </h2>
            <Button size="sm" onClick={handleAddNewCert} className="text-xs font-bold">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Certificate
            </Button>
          </div>

          <Card className="bg-white">
            <CardContent className="p-6">
              {certifications.length === 0 ? (
                <p className="text-xs text-gray-400 font-bold text-center py-4">No certifications registered.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="border border-gray-200 border-solid rounded-xl p-4 flex flex-col justify-between gap-3 shadow-xs hover:border-gray-300 transition-all group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-accent shrink-0" />
                            <h4 className="text-xs font-black text-gray-900 leading-tight truncate max-w-[150px]">
                              {cert.name}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditCert(cert)}
                              className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                              aria-label="Edit cert"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteCert(cert.id)}
                              className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-650 cursor-pointer"
                              aria-label="Delete cert"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] font-bold text-gray-700">{cert.issuing_organization}</p>
                        
                        <div className="text-[9px] text-gray-400 font-bold flex flex-col space-y-0.5">
                          <span>Issued: {formatDate(cert.issue_date)}</span>
                          {cert.expiration_date && <span>Expires: {formatDate(cert.expiration_date)}</span>}
                          {cert.credential_id && <span>ID: {cert.credential_id}</span>}
                        </div>
                      </div>

                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-bold text-primary hover:underline self-start pt-1.5 border-t border-gray-150 border-solid w-full"
                        >
                          Verify Credential Link
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ==========================================
          4. FORM DRAWERS / MODALS OVERLAYS
          ========================================== */}
      {profile && (
        <>
          <ExperienceForm
            candidateId={profile.id}
            experienceToEdit={selectedExp}
            isOpen={isExpOpen}
            onClose={() => setIsExpOpen(false)}
            onSaveSuccess={fetchData}
          />

          <EducationForm
            candidateId={profile.id}
            educationToEdit={selectedEdu}
            isOpen={isEduOpen}
            onClose={() => setIsEduOpen(false)}
            onSaveSuccess={fetchData}
          />

          <CertificationForm
            candidateId={profile.id}
            certificationToEdit={selectedCert}
            isOpen={isCertOpen}
            onClose={() => setIsCertOpen(false)}
            onSaveSuccess={fetchData}
          />
        </>
      )}
    </div>
  );
};
