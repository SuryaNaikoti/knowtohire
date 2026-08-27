import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { FileUploader } from '@/components/ui/FileUploader';
import { knowledgeService, KnowledgeResource, ResourceStatus } from '@/services/knowledgeService';
import { Plus, Trash2, Loader2, Edit3, FileText, Search } from 'lucide-react';

export interface AdminResourcesPageProps {
  onNavigate?: (route: string) => void;
}

export const AdminResourcesPage: React.FC<AdminResourcesPageProps> = ({ onNavigate }) => {
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedResource, setSelectedResource] = useState<KnowledgeResource | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Environmental & ESG');
  const [format, setFormat] = useState('PDF');
  const [status, setStatus] = useState<ResourceStatus>('published');
  const [tagsInput, setTagsInput] = useState('ESG, Compliance, Research');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    const res = await knowledgeService.getResources({
      status: statusFilter === 'all' ? 'all' : (statusFilter as ResourceStatus),
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      search: searchTerm.trim() || undefined,
    });
    if (res.data) {
      setResources(res.data);
    }
    setIsLoading(false);
  }, [searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchResources, 150);
    return () => clearTimeout(timer);
  }, [fetchResources]);

  useEffect(() => {
    const handleStorageChange = () => {
      fetchResources();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('kth_resources_changed', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_resources_changed', handleStorageChange);
      }
    };
  }, [fetchResources]);

  const handleOpenCreateModal = () => {
    setSelectedResource(null);
    setTitle('');
    setDescription('');
    setCategory('Environmental & ESG');
    setFormat('PDF');
    setStatus('published');
    setTagsInput('ESG, Compliance, Research');
    setFileUrl('');
    setSelectedFile(null);
    setUploadProgress(0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r: KnowledgeResource) => {
    setSelectedResource(r);
    setTitle(r.title);
    setDescription(r.description);
    setCategory(r.category);
    setFormat(r.format);
    setStatus(r.status);
    setTagsInput((r.tags || []).join(', '));
    setFileUrl(r.file_url || '');
    setSelectedFile(null);
    setUploadProgress(0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Please enter both title and description.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let res;
    if (selectedResource) {
      res = await knowledgeService.updateResource(selectedResource.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        format,
        status,
        tags,
        file_url: fileUrl.trim() || undefined,
        file: selectedFile || undefined,
        onProgress: (pct) => setUploadProgress(pct),
      });
    } else {
      res = await knowledgeService.createResource({
        title: title.trim(),
        description: description.trim(),
        category,
        format,
        status,
        tags,
        file_url: fileUrl.trim() || undefined,
        file: selectedFile || undefined,
        onProgress: (pct) => setUploadProgress(pct),
      });
    }

    setIsSaving(false);

    if (res.error) {
      setFormError(res.error.message);
    } else {
      setIsModalOpen(false);
      fetchResources();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this resource?')) return;
    await knowledgeService.deleteResource(id);
    fetchResources();
  };

  return (
    <AdminShell title="Knowledge Hub CMS" currentPath="/admin/resources" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-kth-slate-200 shadow-xs">
          <div>
            <h2 className="font-display text-base font-bold text-kth-slate-900">E-Books, Handbooks & Research Documents</h2>
            <p className="text-xs text-kth-slate-500 mt-0.5">
              Upload, manage, and publish educational assets to the KnowToHire Knowledge Hub.
            </p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreateModal}>
            Add New Resource
          </Button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search resources by title, description, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
            />
          </div>
          <div className="w-full md:w-56">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Environmental & ESG', label: 'Environmental & ESG' },
                { value: 'Technology', label: 'Technology' },
                { value: 'Sustainability', label: 'Sustainability' },
                { value: 'Patent & IPR', label: 'Patent & IPR' },
                { value: 'Public Policy', label: 'Public Policy' },
              ]}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>
        </div>

        {/* Resources Table */}
        <Card className="p-0 overflow-hidden rounded-2xl border-kth-slate-200 shadow-xs">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">No resources uploaded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Resource Title</th>
                    <th className="p-4">Category & Tags</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Format & Size</th>
                    <th className="p-4">Downloads</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {resources.map((r) => (
                    <tr key={r.id} className="hover:bg-kth-slate-50/70 transition-colors">
                      <td className="p-4 max-w-xs sm:max-w-sm">
                        <div className="font-bold text-kth-slate-900 text-sm">{r.title}</div>
                        <div className="text-kth-slate-500 text-xs line-clamp-1 mt-0.5">{r.description}</div>
                        {r.file_url && (
                          <div className="flex items-center gap-1 text-[11px] text-kth-primary-600 font-mono mt-1">
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{r.file_name || 'Attached File'}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="cyan">{r.category}</Badge>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {(r.tags || []).slice(0, 2).map((t, idx) => (
                              <span key={idx} className="text-[10px] text-kth-slate-500 bg-kth-slate-100 px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge
                          variant={r.status === 'published' ? 'emerald' : r.status === 'draft' ? 'amber' : 'slate'}
                          className="capitalize font-mono text-[11px]"
                        >
                          {r.status}
                        </Badge>
                      </td>

                      <td className="p-4 font-mono">
                        <span className="font-bold text-kth-slate-900">{r.format}</span>
                        <span className="text-kth-slate-400 block text-[11px]">{r.file_size || '2.4 MB'}</span>
                      </td>

                      <td className="p-4 font-mono text-kth-slate-700">
                        {r.downloads_count.toLocaleString()}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEditModal(r)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDelete(r.id)}
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

        {/* Create / Edit Resource Dialog */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => !isSaving && setIsModalOpen(false)}
          title={selectedResource ? 'Edit Knowledge Hub Resource' : 'Add Knowledge Hub Resource'}
          description="Upload an educational document or handbook to the Knowledge Hub."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveResource} className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {formError}
              </div>
            )}

            <Input
              label="Resource Title *"
              placeholder="e.g. EIA Compliance Handbook 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
                Summary & Learning Objectives *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of guidelines, methodologies, frameworks, or research covered..."
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

              <Select
                label="Publication Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ResourceStatus)}
                options={[
                  { value: 'published', label: 'Published (Live to Candidates)' },
                  { value: 'draft', label: 'Draft (Admin Only)' },
                  { value: 'archived', label: 'Archived (Hidden)' },
                ]}
              />
            </div>

            <Input
              label="Keywords & Tags (Comma Separated)"
              placeholder="e.g. ESG, Compliance, Circular Economy, EIA"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />

            {/* File Upload Component */}
            <FileUploader
              label="Resource File Deliverable"
              description="Drag & drop your handbook or research paper"
              selectedFile={selectedFile}
              uploadedFileName={selectedResource?.file_name || selectedResource?.title}
              uploadedFileSize={selectedResource?.file_size}
              uploadedFormat={selectedResource?.format}
              onFileSelect={(f) => setSelectedFile(f)}
              onFileRemove={() => setSelectedFile(null)}
              isUploading={isSaving}
              uploadProgress={uploadProgress}
              uploadSuccess={Boolean(selectedResource?.file_url || selectedFile)}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-kth-slate-100">
              <Button type="button" variant="secondary" size="sm" disabled={isSaving} onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                {status === 'published' ? 'Publish Resource' : 'Save Draft'}
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AdminShell>
  );
};
