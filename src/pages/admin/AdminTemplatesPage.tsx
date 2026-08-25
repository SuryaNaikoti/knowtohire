import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { FileUploader } from '@/components/ui/FileUploader';
import { templateService, MarketplaceTemplate, TemplateStatus } from '@/services/templateService';
import { Plus, Trash2, Loader2, Edit3, FileText } from 'lucide-react';

export const AdminTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Professional Documents');
  const [priceINR, setPriceINR] = useState('0');
  const [status, setStatus] = useState<TemplateStatus>('published');
  const [formatsInput, setFormatsInput] = useState('DOCX, PDF');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    const res = await templateService.getTemplates({ status: 'all' });
    if (res.data) {
      setTemplates(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTemplates();

    const handleStorageChange = () => {
      fetchTemplates();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('kth_templates_changed', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_templates_changed', handleStorageChange);
      }
    };
  }, [fetchTemplates]);

  const handleOpenCreateModal = () => {
    setSelectedTemplate(null);
    setTitle('');
    setDescription('');
    setCategory('Professional Documents');
    setPriceINR('0');
    setStatus('published');
    setFormatsInput('DOCX, PDF');
    setSelectedFile(null);
    setUploadProgress(0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: MarketplaceTemplate) => {
    setSelectedTemplate(t);
    setTitle(t.title);
    setDescription(t.description);
    setCategory(t.category);
    setPriceINR(String(t.price_inr || 0));
    setStatus(t.status);
    setFormatsInput((t.formats || ['DOCX', 'PDF']).join(', '));
    setSelectedFile(null);
    setUploadProgress(0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Please enter both title and description.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const formats = formatsInput
      .split(',')
      .map((f) => f.trim().toUpperCase())
      .filter(Boolean);

    let res;
    if (selectedTemplate) {
      res = await templateService.updateTemplate(selectedTemplate.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        price_inr: parseFloat(priceINR) || 0,
        formats: formats.length > 0 ? formats : ['DOCX', 'PDF'],
        status,
        file: selectedFile || undefined,
        onProgress: (pct) => setUploadProgress(pct),
      });
    } else {
      res = await templateService.createTemplate({
        title: title.trim(),
        description: description.trim(),
        category,
        price_inr: parseFloat(priceINR) || 0,
        formats: formats.length > 0 ? formats : ['DOCX', 'PDF'],
        status,
        file: selectedFile || undefined,
        onProgress: (pct) => setUploadProgress(pct),
      });
    }

    setIsSaving(false);

    if (res.error) {
      setFormError(res.error.message);
    } else {
      setIsModalOpen(false);
      fetchTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this template?')) return;
    await templateService.deleteTemplate(id);
    fetchTemplates();
  };

  return (
    <AdminShell title="Template Marketplace CMS" currentPath="/admin/templates">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-kth-slate-200 shadow-xs">
          <div>
            <h2 className="font-display text-base font-bold text-kth-slate-900">Professional Templates & Toolkits</h2>
            <p className="text-xs text-kth-slate-500 mt-0.5">
              Upload and publish ATS resume templates, consultancy contracts, and ESG compliance checklists.
            </p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreateModal}>
            Add Template
          </Button>
        </div>

        {/* Templates Table */}
        <Card className="p-0 overflow-hidden rounded-2xl border-kth-slate-200 shadow-xs">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">No templates found in the marketplace.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Template Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Formats</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Downloads</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {templates.map((t) => (
                    <tr key={t.id} className="hover:bg-kth-slate-50/70 transition-colors">
                      <td className="p-4 max-w-xs sm:max-w-sm">
                        <div className="font-bold text-kth-slate-900 text-sm">{t.title}</div>
                        <div className="text-kth-slate-500 text-xs line-clamp-1 mt-0.5">{t.description}</div>
                        {t.file_url && (
                          <div className="flex items-center gap-1 text-[11px] text-kth-primary-600 font-mono mt-1">
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{t.file_name || 'Uploaded Template File'}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <Badge variant="indigo">{t.category}</Badge>
                      </td>

                      <td className="p-4">
                        <Badge
                          variant={t.status === 'published' ? 'emerald' : t.status === 'draft' ? 'amber' : 'slate'}
                          className="capitalize font-mono text-[11px]"
                        >
                          {t.status}
                        </Badge>
                      </td>

                      <td className="p-4 font-mono font-semibold text-kth-slate-700">
                        {t.formats.join(', ')}
                      </td>

                      <td className="p-4 font-mono font-bold text-kth-primary-600">
                        {t.is_free ? 'FREE' : `₹${t.price_inr}`}
                      </td>

                      <td className="p-4 font-mono text-kth-slate-700">
                        {t.downloads_count.toLocaleString()}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEditModal(t)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Create / Edit Template Dialog */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => !isSaving && setIsModalOpen(false)}
          title={selectedTemplate ? 'Edit Template Asset' : 'Add Template Product'}
          description="Publish a new ATS resume or contract template to the marketplace."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveTemplate} className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {formError}
              </div>
            )}

            <Input
              label="Template Title *"
              placeholder="e.g. ATS-Optimised Sustainability Consultant Resume"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
                Description & Structure *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on formatting, industry compliance, and sections..."
                className="w-full rounded-xl border border-kth-slate-200 p-3 text-xs text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Professional Documents', label: 'Professional Documents' },
                  { value: 'Resume Templates', label: 'Resume & CV Templates' },
                  { value: 'Legal & Contracts', label: 'Legal & Contracts' },
                  { value: 'Compliance Toolkits', label: 'Compliance Toolkits' },
                  { value: 'Interview Preparation', label: 'Interview Preparation' },
                ]}
              />

              <Input
                label="Price (INR) — Set 0 for Free"
                type="number"
                value={priceINR}
                onChange={(e) => setPriceINR(e.target.value)}
                required
              />

              <Select
                label="Publication Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TemplateStatus)}
                options={[
                  { value: 'published', label: 'Published (Live to Marketplace)' },
                  { value: 'draft', label: 'Draft (Admin Only)' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>

            <Input
              label="Supported Formats (Comma Separated)"
              placeholder="DOCX, PDF, XLSX"
              value={formatsInput}
              onChange={(e) => setFormatsInput(e.target.value)}
            />

            {/* File Upload Component */}
            <FileUploader
              label="Template File Asset"
              description="Drag & drop your template document (.docx, .pdf, .xlsx, .zip)"
              selectedFile={selectedFile}
              uploadedFileName={selectedTemplate?.file_name || selectedTemplate?.title}
              uploadedFileSize={selectedTemplate?.file_size}
              uploadedFormat={selectedTemplate?.formats[0]}
              onFileSelect={(f) => setSelectedFile(f)}
              onFileRemove={() => setSelectedFile(null)}
              isUploading={isSaving}
              uploadProgress={uploadProgress}
              uploadSuccess={Boolean(selectedTemplate?.file_url || selectedFile)}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-kth-slate-100">
              <Button type="button" variant="secondary" size="sm" disabled={isSaving} onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                {status === 'published' ? 'Publish Template' : 'Save Draft'}
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AdminShell>
  );
};
