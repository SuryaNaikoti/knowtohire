import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { candidateService } from '../../../lib/services/candidateService';
import type { CandidateEducation } from '../../../lib/services/candidateService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { EducationForm } from '../../../components/dashboard/EducationForm';
import { BookOpen, Plus, Trash2, Edit2, Calendar } from 'lucide-react';

export const Education: React.FC = () => {
  const { profile } = useAuth();
  const [education, setEducation] = useState<CandidateEducation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<CandidateEducation | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    if (!profile) return;
    try {
      const data = await candidateService.getEducation(profile.id);
      setEducation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  const handleAdd = () => {
    setSelectedEdu(null);
    setIsModalOpen(true);
  };

  const handleEdit = (edu: CandidateEducation) => {
    setSelectedEdu(edu);
    setIsModalOpen(true);
  };

  const handleDelete = async (eduId: string) => {
    if (!profile || !window.confirm('Remove this education record?')) return;
    setDeleting(eduId);
    try {
      await candidateService.deleteEducation(profile.id, eduId);
      setEducation((prev) => prev.filter((e) => e.id !== eduId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = () => {
    setIsModalOpen(false);
    fetchData();
  };

  if (loading) return <Loading label="Loading education..." />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Education History
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Manage your academic profile and credentials.
          </p>
        </div>
        <Button onClick={handleAdd} className="font-bold text-xs shrink-0 flex items-center gap-1.5 w-full md:w-auto justify-center">
          <Plus className="w-4 h-4" /> Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm font-bold text-gray-600">No education history added yet.</p>
          <p className="text-xs text-gray-400 font-medium">Adding education increases profile credibility and matching indices with employers.</p>
          <Button onClick={handleAdd} className="text-xs font-bold">
            Add First Education Record
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <Card key={edu.id} className="bg-white hover:shadow-xs transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-heading font-black text-gray-900 text-sm leading-tight">
                        {edu.degree} in {edu.field_of_study}
                      </h3>
                      <p className="text-xs font-bold text-gray-700">{edu.institution}</p>
                      <p className="text-[11px] text-gray-450 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                        {edu.end_date
                          ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : 'Present'}
                      </p>
                      {edu.description && (
                        <p className="text-xs text-gray-650 font-medium mt-3 whitespace-pre-wrap leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(edu)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-primary transition cursor-pointer"
                      aria-label="Edit education"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(edu.id)}
                      disabled={deleting === edu.id}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                      aria-label="Delete education"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Render EducationForm Directly as it handles modal wrapping internally */}
      {profile && (
        <EducationForm
          candidateId={profile.id}
          educationToEdit={selectedEdu}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaveSuccess={handleSaved}
        />
      )}
    </div>
  );
};
export default Education;
