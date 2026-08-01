import React, { useState } from 'react';
import { useCareerEvidence } from '../../../context/CareerEvidenceContext';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Plus, Trash2, GraduationCap, Calendar, BookOpen } from 'lucide-react';

export const EducationProgressionEditor: React.FC = () => {
  const { educationList, addEducation, deleteEducation } = useCareerEvidence();

  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gradeGpa, setGradeGpa] = useState('');
  const [honors, setHonors] = useState('');
  const [coursework, setCoursework] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !degree || !startDate) return;

    await addEducation({
      institution,
      degree,
      field_of_study: fieldOfStudy,
      start_date: startDate,
      end_date: endDate || null,
      grade_gpa: gradeGpa,
      honors: honors ? honors.split(',').map((h) => h.trim()) : [],
      relevant_coursework: coursework ? coursework.split(',').map((c) => c.trim()) : [],
      description,
      verification_status: 'Verified',
    });

    setInstitution('');
    setDegree('');
    setFieldOfStudy('');
    setStartDate('');
    setEndDate('');
    setGradeGpa('');
    setHonors('');
    setCoursework('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>Add Academic Progression Evidence</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Institution / University *"
            placeholder="e.g. Stanford University or IIT Madras"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            required
          />

          <Input
            label="Degree / Accreditation *"
            placeholder="e.g. Bachelor of Science in Mechanical Engineering"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Field of Study / Major"
            placeholder="e.g. Environmental Engineering"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
          />

          <Input
            label="GPA / Grade (Optional)"
            placeholder="e.g. 3.8 / 4.0 or First Class Honors"
            value={gradeGpa}
            onChange={(e) => setGradeGpa(e.target.value)}
          />

          <Input
            label="Honors & Awards"
            placeholder="e.g. Dean's List, Gold Medalist"
            value={honors}
            onChange={(e) => setHonors(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <Input
            label="End Date / Expected Graduation"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Input
          label="Relevant Coursework (Comma separated)"
          placeholder="e.g. Fluid Mechanics, Environmental Auditing, ESG Metrics"
          leftIcon={<BookOpen className="w-4 h-4" />}
          value={coursework}
          onChange={(e) => setCoursework(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Academic Overview & Capstone Summary</label>
          <textarea
            rows={3}
            placeholder="Describe key projects, thesis, or academic honors..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Save Academic Evidence</span>
        </Button>
      </form>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Recorded Academic Progression ({educationList.length})
        </h4>

        {educationList.map((edu) => (
          <div key={edu.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{edu.degree}</span>
                  <span className="text-xs font-semibold text-emerald-600">@ {edu.institution}</span>
                </h4>
                <p className="text-xs text-slate-500">{edu.start_date} - {edu.end_date || 'Present'} • {edu.field_of_study}</p>
              </div>

              <div className="flex items-center gap-2">
                {edu.grade_gpa && (
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full border border-slate-200">
                    GPA: {edu.grade_gpa}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => deleteEducation(edu.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700">{edu.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
