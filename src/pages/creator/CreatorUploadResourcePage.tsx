import React, { useState } from 'react';
import { CreatorShell } from '@/components/creator/CreatorShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileUploader } from '@/components/ui/FileUploader';
import { knowledgeService, CreateResourceInput } from '@/services/knowledgeService';
import {
  ArrowLeft,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export interface CreatorUploadResourcePageProps {
  onNavigate?: (path: string) => void;
}

export const CreatorUploadResourcePage: React.FC<CreatorUploadResourcePageProps> = ({ onNavigate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Environmental Careers');
  const [format, setFormat] = useState('PDF');
  const [priceINR, setPriceINR] = useState(499);
  const [isFree, setIsFree] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('Please enter a descriptive resource title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a brief description and learning outline.');
      return;
    }

    setIsSubmitting(true);
    const payload: CreateResourceInput = {
      title: title.trim(),
      description: description.trim(),
      category,
      format,
      price_inr: isFree ? 0 : Number(priceINR) || 0,
      is_free: isFree,
      status: 'pending_review',
      selling_price_inr: isFree ? 0 : Number(priceINR) || 0,
      submitted_at: new Date().toISOString(),
      file: file || undefined,
      onProgress: (pct) => setUploadProgress(pct),
    };

    const res = await knowledgeService.createResource(payload);
    setIsSubmitting(false);
    setUploadProgress(0);

    if (res.error) {
      setError(res.error.message);
    } else {
      setSuccess(`Resource "${res.data?.title}" submitted for Admin review! You will be notified once commercial terms are assigned.`);
      setTimeout(() => {
        handleNavigate('/creator');
      }, 1500);
    }
  };

  return (
    <CreatorShell title="Upload Knowledge Resource" currentPath="/creator/resources/new" onNavigate={onNavigate}>
      <div className="max-w-4xl mx-auto space-y-6 font-sans pb-12">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNavigate('/creator')}
            className="inline-flex items-center gap-2 text-xs font-bold text-kth-slate-600 hover:text-kth-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Creator Studio</span>
          </button>
          <span className="text-[11px] font-semibold text-kth-slate-400">
            Guaranteed 70% Creator Commission
          </span>
        </div>

        {/* Header Title Card */}
        <div className="rounded-2xl bg-gradient-to-r from-kth-slate-900 via-kth-slate-800 to-[#0c182c] border border-kth-slate-800 p-6 text-white shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-kth-primary-500/20 text-kth-primary-300 border border-kth-primary-500/30 mb-2">
                <BookOpen className="w-3 h-3 text-kth-primary-300" />
                Knowledge Publishing Portal
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                Upload New Knowledge Resource
              </h1>
              <p className="text-xs sm:text-sm text-kth-slate-300 mt-1">
                Publish comprehensive e-books, technical manuals, regulatory compendiums, and executive research frameworks.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-kth-slate-900 border-b border-kth-slate-100 pb-3">
              1. Resource Information
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700">
                Resource Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CSRD & European ESG Reporting Master Guide 2026"
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-100 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-kth-slate-700">Domain Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 bg-white"
                >
                  <option value="Environmental Careers">Environmental Careers</option>
                  <option value="Climate Tech & Energy">Climate Tech & Energy</option>
                  <option value="ESG & Corporate Governance">ESG & Corporate Governance</option>
                  <option value="Circular Economy & Waste">Circular Economy & Waste</option>
                  <option value="Sustainable Finance">Sustainable Finance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-kth-slate-700">Document Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 bg-white"
                >
                  <option value="PDF">PDF E-Book</option>
                  <option value="DOCX">DOCX Word Guide</option>
                  <option value="PPTX">PPTX Presentation</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700">
                Description & Learning Outcomes <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a thorough synopsis of the guide, key regulatory mandates referenced, practical frameworks included, and who should read it..."
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-100"
              />
            </div>
          </Card>

          {/* Pricing & Commercial Terms */}
          <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-kth-slate-100 pb-3 gap-1">
              <h2 className="text-sm font-bold text-kth-slate-900">
                2. Commercial Terms & Suggested Pricing
              </h2>
              <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                Admin Approves Final Price & Royalty
              </span>
            </div>

            <p className="text-xs text-kth-slate-600 leading-relaxed">
              KnowToHire Admin establishes the marketplace selling price and platform commission (typically 70% to creator). You will be given the formal commercial agreement to review and accept before publication.
            </p>

            <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="res-free"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 rounded text-kth-primary-600 focus:ring-kth-primary-500 border-kth-slate-300 cursor-pointer"
                />
                <label htmlFor="res-free" className="text-xs font-bold text-kth-slate-700 cursor-pointer">
                  Request as Free Community Resource
                </label>
              </div>

              {!isFree && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-kth-slate-600">Suggested Price (INR):</span>
                  <div className="relative w-36">
                    <span className="absolute left-3 top-2 text-xs font-bold text-kth-slate-400">₹</span>
                    <input
                      type="number"
                      min={49}
                      step={50}
                      value={priceINR}
                      onChange={(e) => setPriceINR(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold pl-7 pr-3 py-1.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {!isFree && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-center justify-between text-xs text-emerald-800 font-medium">
                <span>Estimated creator royalty per purchase (~70% standard):</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  ₹{Math.round((Number(priceINR) || 0) * 0.7).toLocaleString()}
                </span>
              </div>
            )}
          </Card>

          {/* Master Deliverable File Upload */}
          <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-kth-slate-900 border-b border-kth-slate-100 pb-3">
              3. Deliverable Asset File
            </h2>

            <FileUploader
              label="Resource Source Document (File)"
              description="Upload the final e-book or guidebook (PDF, DOCX, PPTX, ZIP)"
              accept=".pdf,.docx,.doc,.pptx,.zip"
              selectedFile={file}
              onFileSelect={(f) => setFile(f)}
              onFileRemove={() => setFile(null)}
              isUploading={isSubmitting && uploadProgress > 0}
              uploadProgress={uploadProgress}
              uploadSuccess={Boolean(file)}
            />
          </Card>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => handleNavigate('/creator')}
              className="text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<UploadCloud className="w-4 h-4" />}
              className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-bold text-xs cursor-pointer px-6"
            >
              Submit Resource for Admin Review
            </Button>
          </div>
        </form>
      </div>
    </CreatorShell>
  );
};
