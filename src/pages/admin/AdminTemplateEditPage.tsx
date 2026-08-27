import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { templateService, TemplateStatus } from '@/services/templateService';
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  ShoppingBag,
  Tag,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export interface AdminTemplateEditPageProps {
  templateId?: string;
  onNavigate?: (path: string) => void;
}

export const AdminTemplateEditPage: React.FC<AdminTemplateEditPageProps> = ({ templateId: propTemplateId, onNavigate }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = propTemplateId || paramId;
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Resume & CV Templates');
  const [priceINR, setPriceINR] = useState('0');
  const [status, setStatus] = useState<TemplateStatus>('published');
  const [formatsInput, setFormatsInput] = useState('DOCX, PDF');
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      templateService.getTemplateById(id).then((res) => {
        if (res.data) {
          setTitle(res.data.title);
          setDescription(res.data.description);
          setCategory(res.data.category);
          setPriceINR(String(res.data.price_inr || 0));
          setStatus(res.data.status);
          setFormatsInput(res.data.formats?.join(', ') || 'DOCX, PDF');
          setPreviewUrl(res.data.cover_url || '');
          setFileUrl(res.data.file_url || '');
        } else {
          setError('Template product not found.');
        }
        setIsLoading(false);
      });
    }
  }, [id, isEditing]);

  const handleSave = async (forcedStatus?: TemplateStatus) => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const formatsArray = formatsInput
      .split(',')
      .map((f) => f.trim().toUpperCase())
      .filter(Boolean);

    const priceNum = Math.max(0, parseInt(priceINR, 10) || 0);
    const targetStatus = forcedStatus || status;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      price_inr: priceNum,
      status: targetStatus,
      file_formats: formatsArray.length > 0 ? formatsArray : ['DOCX', 'PDF'],
      preview_image_url: previewUrl.trim() || undefined,
      file_url: fileUrl.trim() || 'https://assets.knowtohire.com/templates/sample.docx',
    };

    try {
      if (isEditing && id) {
        const res = await templateService.updateTemplate(id, payload);
        if (res.error) {
          setError(res.error.message);
        } else {
          setSuccessMessage('Template product updated successfully.');
          setTimeout(() => handleBack(), 600);
        }
      } else {
        const res = await templateService.createTemplate(payload);
        if (res.error) {
          setError(res.error.message);
        } else {
          setSuccessMessage('Template published to marketplace catalog.');
          setTimeout(() => handleBack(), 600);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/admin/templates');
    } else {
      navigate('/admin/templates');
    }
  };

  return (
    <AdminShell
      title={isEditing ? 'Edit Marketplace Template' : 'Add Marketplace Template'}
      currentPath="/admin/templates"
      onNavigate={onNavigate}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Template Catalog</span>
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
            <p className="text-xs text-kth-slate-500 font-medium">Loading template specifications...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-6 sm:p-8 space-y-6 bg-white border-kth-slate-200 shadow-sm">
                <div className="space-y-4">
                  <Input
                    label="Template Title *"
                    placeholder="e.g. ATS-Optimised Sustainability Consultant Resume Template"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-kth-slate-700">
                      Product Description & Framework Details *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Comprehensive overview of format structure, ATS compatibility, and professional sections..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Downloadable Asset File URL"
                      placeholder="https://assets.knowtohire.com/templates/sample.docx"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                    />

                    <Input
                      label="Preview Mockup Image URL"
                      placeholder="https://images.unsplash.com/..."
                      value={previewUrl}
                      onChange={(e) => setPreviewUrl(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="p-6 space-y-4 bg-white border-kth-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-kth-slate-100 pb-3">
                  <Send className="w-4 h-4 text-kth-primary-600" />
                  Publishing & Actions
                </h3>

                <div className="space-y-3 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full text-xs font-bold bg-kth-primary-600 hover:bg-kth-primary-700 text-white shadow-xs"
                    leftIcon={<ShoppingBag className="w-4 h-4" />}
                    isLoading={isSaving}
                    onClick={() => handleSave('published')}
                  >
                    {isEditing ? 'Update Template' : 'Publish to Marketplace'}
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
                  Catalog Classification
                </h3>

                <div className="space-y-4 text-xs">
                  <Select
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[
                      { value: 'Professional Documents', label: 'Professional Documents' },
                      { value: 'Resume & CV Templates', label: 'Resume & CV Templates' },
                      { value: 'Legal & Contracts', label: 'Legal & Contracts' },
                      { value: 'Compliance Toolkits', label: 'Compliance Toolkits' },
                      { value: 'Interview Preparation', label: 'Interview Preparation' },
                    ]}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-kth-slate-700 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-kth-slate-500" />
                      <span>Price in INR (0 = Free)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={priceINR}
                      onChange={(e) => setPriceINR(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent font-mono"
                    />
                  </div>

                  <Input
                    label="Supported Formats"
                    placeholder="DOCX, PDF, XLSX"
                    value={formatsInput}
                    onChange={(e) => setFormatsInput(e.target.value)}
                  />

                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TemplateStatus)}
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
