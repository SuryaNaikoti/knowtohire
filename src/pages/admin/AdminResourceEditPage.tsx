import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FileUploader } from '@/components/ui/FileUploader';
import { knowledgeService, ResourceStatus } from '@/services/knowledgeService';
import { navigateTo } from '@/utils/navigation';
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  BookOpen,
  Tag,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

export interface AdminResourceEditPageProps {
  resourceId?: string;
  onNavigate?: (path: string) => void;
}

export const AdminResourceEditPage: React.FC<AdminResourceEditPageProps> = ({ resourceId: propResourceId, onNavigate }) => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const pathId = currentPath.startsWith('/admin/resources/') ? currentPath.replace('/admin/resources/', '').replace('/edit', '') : '';
  const id = propResourceId || pathId;
  const isEditing = Boolean(id && id !== 'new');

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Environmental & ESG');
  const [format, setFormat] = useState('PDF');
  const [status, setStatus] = useState<ResourceStatus>('published');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('4.2 MB');
  const [tagsInput, setTagsInput] = useState('Compliance, Guidelines, ESG');

  // Physical File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      knowledgeService.getResourceById(id).then((res) => {
        if (res.data) {
          setTitle(res.data.title);
          setDescription(res.data.description);
          setCategory(res.data.category);
          setFormat(res.data.format || 'PDF');
          setStatus(res.data.status);
          setFileUrl(res.data.file_url || '');
          setFileName(res.data.file_name || '');
          setFileSize(res.data.file_size || '4.2 MB');
          setTagsInput(res.data.tags?.join(', ') || 'Compliance, Guidelines');
        } else {
          setError('Knowledge resource asset not found.');
        }
        setIsLoading(false);
      });
    }
  }, [id, isEditing]);

  const handleSave = async (forcedStatus?: ResourceStatus) => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const targetStatus = forcedStatus || status;

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      category,
      file_format: format,
      status: targetStatus,
      tags: tagsArray.length > 0 ? tagsArray : ['Compliance', 'ESG'],
      file_url: fileUrl.trim() || undefined,
      file_name: fileName.trim() || undefined,
      file_size: fileSize.trim() || undefined,
      file: selectedFile || undefined,
      onProgress: (pct: number) => setUploadProgress(pct),
    };

    try {
      if (isEditing && id) {
        const res = await knowledgeService.updateResource(id, payload);
        if (res.error) {
          setError(res.error.message);
        } else {
          setSuccessMessage('Resource and asset file updated successfully.');
          setTimeout(() => handleBack(), 600);
        }
      } else {
        const res = await knowledgeService.createResource(payload);
        if (res.error) {
          setError(res.error.message);
        } else {
          setSuccessMessage('Resource and asset file published to Knowledge Hub.');
          setTimeout(() => handleBack(), 600);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save resource.');
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/admin/resources');
    } else {
      navigateTo('/admin/resources');
    }
  };

  return (
    <AdminShell
      title={isEditing ? 'Edit Knowledge Resource' : 'Add Knowledge Resource'}
      currentPath="/admin/resources"
      onNavigate={onNavigate}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Knowledge Hub Directory</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {isLoading ? (
          <Card className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">Loading resource details...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-6 sm:p-8 space-y-6 bg-white border-kth-slate-200 shadow-sm">
                <div className="space-y-4">
                  <Input
                    label="Resource Title *"
                    placeholder="e.g. Environmental Impact Assessment (EIA) Handbook 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-kth-slate-700">
                      Summary & Learning Objectives *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Comprehensive overview of regulatory guidelines, statutory checklists, and career methodologies..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent leading-relaxed"
                    />
                  </div>

                  {/* Downloadable Knowledge Document File Upload */}
                  <div className="pt-2 border-t border-kth-slate-100 space-y-3">
                    <FileUploader
                      label="Resource Document File (Upload)"
                      description="Upload source file (PDF, DOCX, XLSX, PPTX, ZIP, CSV, TXT)"
                      accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.zip,.txt,.csv"
                      selectedFile={selectedFile}
                      uploadedFileName={fileName || (fileUrl ? fileUrl.split('/').pop() : undefined)}
                      uploadedFileSize={fileSize}
                      onFileSelect={(file) => {
                        setSelectedFile(file);
                        setFileName(file.name);
                        setFileSize((file.size / (1024 * 1024)).toFixed(1) + ' MB');
                      }}
                      onFileRemove={() => {
                        setSelectedFile(null);
                        setFileName('');
                        setFileSize('4.2 MB');
                        setFileUrl('');
                      }}
                      isUploading={isSaving && uploadProgress > 0 && uploadProgress < 100}
                      uploadProgress={uploadProgress}
                      uploadSuccess={Boolean(fileUrl || selectedFile)}
                    />

                    {fileUrl && !selectedFile && (
                      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold block">Current Knowledge Deliverable Attached</span>
                            <span className="text-emerald-700 font-mono text-[11px]">
                              {fileName || fileUrl.split('/').pop()} {fileSize ? `(${fileSize})` : ''}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => window.open(fileUrl, '_blank')}
                          className="text-xs font-semibold bg-white shadow-2xs"
                        >
                          Download Resource
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Document Download URL (Optional Fallback)"
                      placeholder="https://assets.knowtohire.com/resources/sample.pdf"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      helperText="Auto-filled on file upload or enter asset link"
                    />

                    <Input
                      label="File Size"
                      placeholder="e.g. 4.2 MB"
                      value={fileSize}
                      onChange={(e) => setFileSize(e.target.value)}
                      helperText="Calculated automatically on file upload"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="p-6 space-y-4 bg-white border-kth-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-kth-slate-100 pb-3">
                  <Send className="w-4 h-4 text-kth-primary-600" />
                  Publishing Status
                </h3>

                <div className="space-y-3 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full text-xs font-bold bg-kth-primary-600 hover:bg-kth-primary-700 text-white shadow-xs"
                    leftIcon={<BookOpen className="w-4 h-4" />}
                    isLoading={isSaving}
                    onClick={() => handleSave('published')}
                  >
                    {isEditing ? 'Update Resource' : 'Publish to Hub'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full text-xs font-semibold border-kth-slate-200"
                    leftIcon={<Save className="w-4 h-4 text-kth-slate-500" />}
                    isLoading={isSaving}
                    onClick={() => handleSave('draft')}
                  >
                    Save as Draft
                  </Button>
                </div>
              </Card>

              <Card className="p-6 space-y-4 bg-white border-kth-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-kth-slate-100 pb-3">
                  <Tag className="w-4 h-4 text-kth-primary-600" />
                  Classification & Metadata
                </h3>

                <div className="space-y-4 text-xs">
                  <Select
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[
                      { value: 'Environmental & ESG', label: 'Environmental & ESG' },
                      { value: 'Technology', label: 'Technology & Cloud' },
                      { value: 'Sustainability', label: 'Sustainability & Climate' },
                      { value: 'Patent & IPR', label: 'Patent & Intellectual Property' },
                      { value: 'Public Policy', label: 'Public Policy & Economics' },
                      { value: 'Career & Professional', label: 'Career & Professional' },
                    ]}
                  />

                  <Select
                    label="Document Format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    options={[
                      { value: 'PDF', label: 'PDF Document' },
                      { value: 'DOCX', label: 'Word (.docx)' },
                      { value: 'PPTX', label: 'Presentation (.pptx)' },
                      { value: 'XLSX', label: 'Spreadsheet (.xlsx)' },
                    ]}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-kth-slate-700">
                      Focus Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Compliance, Guidelines, ESG"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent"
                    />
                  </div>

                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ResourceStatus)}
                    options={[
                      { value: 'published', label: 'Published (Live)' },
                      { value: 'draft', label: 'Draft (Admin Only)' },
                      { value: 'archived', label: 'Archived' },
                    ]}
                  />
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};
