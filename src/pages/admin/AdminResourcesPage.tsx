import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { knowledgeService, KnowledgeResource } from '@/services/knowledgeService';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export const AdminResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Environmental & ESG');
  const [format, setFormat] = useState('PDF');
  const [fileUrl, setFileUrl] = useState('');

  const fetchResources = async () => {
    setIsLoading(true);
    const res = await knowledgeService.getResources();
    if (res.data) {
      setResources(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSaving(true);

    await knowledgeService.createResource({
      title: title.trim(),
      description: description.trim(),
      category,
      format,
      file_url: fileUrl.trim() || undefined,
    });

    setIsSaving(false);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setFileUrl('');
    fetchResources();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    await knowledgeService.deleteResource(id);
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <AdminShell title="Knowledge Hub CMS" currentPath="/admin/resources">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div>
            <h2 className="font-display text-base font-bold text-kth-slate-900">E-Books, Handbooks & Research Documents</h2>
            <p className="text-xs text-kth-slate-500">Manage public and authenticated learning assets in the Knowledge Hub.</p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Add New Resource
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
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
                    <th className="p-4">Category</th>
                    <th className="p-4">Format</th>
                    <th className="p-4">Downloads</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {resources.map((r) => (
                    <tr key={r.id} className="hover:bg-kth-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-kth-slate-900">{r.title}</div>
                        <div className="text-kth-slate-500 text-[11px] line-clamp-1">{r.description}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="cyan">{r.category}</Badge>
                      </td>
                      <td className="p-4 font-mono font-semibold">{r.format}</td>
                      <td className="p-4 font-mono">{r.downloads_count.toLocaleString()}</td>
                      <td className="p-4 font-mono font-bold text-amber-600">★ {r.rating}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Create Resource Dialog */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Knowledge Hub Resource"
          description="Upload or publish an educational document to the Knowledge Hub."
          maxWidth="md"
        >
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <Input
              label="Resource Title"
              placeholder="e.g. EIA Compliance Handbook 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of guidelines, methodologies, or research covered..."
                className="w-full rounded-xl border border-kth-slate-200 p-2.5 text-xs text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Environmental & ESG"
              />
              <Input label="Format" value={format} onChange={(e) => setFormat(e.target.value)} placeholder="PDF" />
            </div>
            <Input
              label="File URL / Storage Link"
              placeholder="https://... (or Supabase storage link)"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-kth-slate-100">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Publish Resource
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AdminShell>
  );
};
