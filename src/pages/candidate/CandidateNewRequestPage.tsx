import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { requestService } from '@/services/requestService';
import {
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CandidateNewRequestPageProps {
  onNavigate?: (path: string) => void;
}

export const CandidateNewRequestPage: React.FC<CandidateNewRequestPageProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState('Study Material');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [preferredFormat, setPreferredFormat] = useState('PDF');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and detailed scope for your request.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await requestService.createRequest({
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      preferred_format: preferredFormat,
      additional_requirements: additionalRequirements.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error.message);
    } else {
      setSuccessToast('Your content request has been submitted to the editorial queue!');
      setTimeout(() => handleBack(), 800);
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/candidate/requests');
    } else {
      navigate('/candidate/requests');
    }
  };

  return (
    <CandidateShell title="Request Custom Study Material" currentPath="/candidate/requests">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Content Requests</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">KnowToHire Editorial Research Desk</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Need a bespoke compliance handbook, sector syllabus, or domain interview case study? Submit your request and our research desk will draft and publish a verified deliverable.
            </p>
          </div>
        </div>

        <Card className="p-6 sm:p-8 bg-white border-kth-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Request Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'Study Material', label: 'Study Material & Handbook' },
                  { value: 'Document Template', label: 'Document / Resume Template' },
                  { value: 'Interview Guide', label: 'Domain Interview Guide' },
                  { value: 'Case Study', label: 'ESG / Technical Case Study' },
                ]}
              />

              <Select
                label="Industry Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Technology', label: 'Technology & Cloud' },
                  { value: 'Environmental & ESG', label: 'Environmental & ESG' },
                  { value: 'Sustainability', label: 'Sustainability & Climate' },
                  { value: 'Patent & IPR', label: 'Patent & Intellectual Property' },
                  { value: 'Public Policy', label: 'Public Policy & Economics' },
                  { value: 'Career & Professional', label: 'Career & Professional' },
                ]}
              />
            </div>

            <Input
              label="Request Title *"
              placeholder="e.g. BRSR Core Audit Methodology & Assurance Checklist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-kth-slate-700">
                Detailed Scope & Learning Requirements *
              </label>
              <textarea
                rows={5}
                placeholder="Specify the guidelines, statutory frameworks (e.g. SEBI, MCA, GHG Protocol), or career topics you need covered in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Preferred File Format"
                value={preferredFormat}
                onChange={(e) => setPreferredFormat(e.target.value)}
                options={[
                  { value: 'PDF', label: 'PDF Document' },
                  { value: 'DOCX', label: 'Word (.docx)' },
                  { value: 'PPTX', label: 'Presentation (.pptx)' },
                  { value: 'XLSX', label: 'Spreadsheet (.xlsx)' },
                ]}
              />

              <Input
                label="Additional Instructions (Optional)"
                placeholder="e.g. Include 2026 statutory updates"
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-kth-slate-100 flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={handleBack}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Send className="w-4 h-4" />}
                isLoading={isSubmitting}
                className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-bold"
              >
                Submit to Editorial Desk
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </CandidateShell>
  );
};
