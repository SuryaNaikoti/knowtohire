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
import {
  Plus,
  Trash2,
  Loader2,
  Edit3,
  FileText,
  Search,
  Download,
  ExternalLink,
  Layers,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  AlertCircle,
} from 'lucide-react';

export interface AdminTemplatesPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminTemplatesPage: React.FC<AdminTemplatesPageProps> = ({ onNavigate }) => {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);

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

  const handleQuickStatusChange = async (id: string, newStatus: TemplateStatus) => {
    setActionLoadingId(id);
    await templateService.updateTemplateStatus(id, newStatus);
    setActionLoadingId(null);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this template?')) return;
    await templateService.deleteTemplate(id);
    fetchTemplates();
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = categoryFilter === 'all' || t.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI Calculations
  const totalCount = templates.length;
  const publishedCount = templates.filter((t) => t.status === 'published').length;
  const draftCount = templates.filter((t) => t.status === 'draft').length;
  const totalDownloads = templates.reduce((sum, t) => sum + (t.downloads_count || 0), 0);

  const getStatusBadge = (tStatus: TemplateStatus) => {
    switch (tStatus) {
      case 'published':
        return (
          <Badge variant="emerald" className="capitalize font-mono text-[10px]" hasPulse>
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="amber" className="capitalize font-mono text-[10px]">
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="slate" className="capitalize font-mono text-[10px]">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="slate">{tStatus}</Badge>;
    }
  };

  return (
    <AdminShell title="Template Marketplace CMS" currentPath="/admin/templates" onNavigate={onNavigate}>
      <div className="space-y-6 font-sans">
        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Templates</p>
                <h3 className="text-2xl font-extrabold text-kth-slate-900 mt-0.5">{totalCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Published & Live</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{publishedCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Drafts in Progress</p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{draftCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Downloads</p>
                <h3 className="text-2xl font-extrabold text-kth-primary-600 mt-0.5">
                  {totalDownloads > 1000 ? `${(totalDownloads / 1000).toFixed(1)}k` : totalDownloads}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Toolbar & Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search templates by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'Resume', label: 'Resume & CV Templates' },
                  { value: 'Legal', label: 'Legal & Contracts' },
                  { value: 'Compliance', label: 'Compliance Toolkits' },
                  { value: 'Professional', label: 'Professional Documents' },
                ]}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'published', label: 'Published (Live)' },
                  { value: 'draft', label: 'Drafts Only' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-kth-slate-100">
            <span className="text-xs font-mono text-kth-slate-500 font-bold shrink-0">
              {filteredTemplates.length} of {templates.length} Assets
            </span>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreateModal}>
              Add Template
            </Button>
          </div>
        </div>

        {/* Templates Table Card */}
        <Card className="p-0 overflow-hidden border-kth-slate-200 bg-white shadow-xs">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500 font-medium">Loading templates repository...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-16 text-center text-kth-slate-500 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-kth-slate-400 mx-auto mb-1" />
              <p className="font-bold text-sm text-kth-slate-700">No Templates Found</p>
              <p>Try refining your search keyword or clearing the status/category filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Template Title & Asset</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Formats</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Downloads</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {filteredTemplates.map((t) => (
                    <tr key={t.id} className="hover:bg-kth-slate-50/70 transition-colors">
                      <td className="p-4 max-w-xs sm:max-w-sm">
                        <div className="font-bold text-kth-slate-900 text-sm">{t.title}</div>
                        <div className="text-kth-slate-500 text-xs line-clamp-1 mt-0.5">{t.description}</div>
                        {t.file_url && (
                          <div className="flex items-center gap-1 text-[11px] text-kth-primary-600 font-mono mt-1">
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{t.file_name || 'Uploaded Template Document'}</span>
                            {t.file_size && <span className="text-kth-slate-400">({t.file_size})</span>}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <Badge variant="indigo" className="text-[10px]">
                          {t.category}
                        </Badge>
                      </td>

                      <td className="p-4">{getStatusBadge(t.status)}</td>

                      <td className="p-4 font-mono font-semibold text-kth-slate-700">{t.formats.join(', ')}</td>

                      <td className="p-4 font-mono font-bold text-kth-primary-600">
                        {t.is_free ? 'FREE' : `₹${t.price_inr}`}
                      </td>

                      <td className="p-4 font-mono text-kth-slate-700">{t.downloads_count.toLocaleString()}</td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status !== 'published' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Publish Template to Live Marketplace"
                              leftIcon={<Play className="w-3.5 h-3.5 text-emerald-600" />}
                              isLoading={actionLoadingId === t.id}
                              onClick={() => handleQuickStatusChange(t.id, 'published')}
                            >
                              Publish
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              title="Revert to Draft"
                              leftIcon={<Pause className="w-3.5 h-3.5 text-amber-600" />}
                              isLoading={actionLoadingId === t.id}
                              onClick={() => handleQuickStatusChange(t.id, 'draft')}
                            >
                              Draft
                            </Button>
                          )}

                          <a
                            href={`/templates/${t.slug || t.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-kth-slate-200 text-kth-slate-600 hover:text-kth-primary-600 hover:bg-white transition-colors"
                            title="Preview Public Listing"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEditModal(t)}
                          >
                            Edit
                          </Button>

                          {t.status !== 'archived' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:bg-rose-50"
                              title="Archive Template"
                              onClick={() => handleDelete(t.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{formError}</div>
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
                className="w-full rounded-xl border border-kth-slate-200 p-3 text-xs text-kth-slate-900 outline-hidden focus:ring-2 focus:ring-kth-primary-500/20 resize-none bg-white"
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
                  { value: 'Resume & CV Templates', label: 'Resume & CV Templates' },
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
