import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { templateService, MarketplaceTemplate } from '@/services/templateService';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export const AdminTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceINR, setPriceINR] = useState('0');
  const [fileUrl, setFileUrl] = useState('');

  const fetchTemplates = async () => {
    setIsLoading(true);
    const res = await templateService.getTemplates();
    if (res.data) {
      setTemplates(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSaving(true);

    await templateService.createTemplate({
      title: title.trim(),
      description: description.trim(),
      price_inr: parseFloat(priceINR) || 0,
      file_url: fileUrl.trim() || undefined,
    });

    setIsSaving(false);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setPriceINR('0');
    setFileUrl('');
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    await templateService.deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AdminShell title="Template Marketplace CMS" currentPath="/admin/templates">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div>
            <h2 className="font-display text-base font-bold text-kth-slate-900">Professional Templates & Toolkits</h2>
            <p className="text-xs text-kth-slate-500">Manage ATS resume templates, consultancy contracts, and ESG compliance checklists.</p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Add Template
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
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
                    <th className="p-4">Formats</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Downloads</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {templates.map((t) => (
                    <tr key={t.id} className="hover:bg-kth-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-kth-slate-900">{t.title}</div>
                        <div className="text-kth-slate-500 text-[11px] line-clamp-1">{t.description}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="indigo">{t.category}</Badge>
                      </td>
                      <td className="p-4 font-mono font-semibold">{t.formats.join(', ')}</td>
                      <td className="p-4 font-mono font-bold text-kth-primary-600">
                        {t.is_free ? 'FREE' : `₹${t.price_inr}`}
                      </td>
                      <td className="p-4 font-mono">{t.downloads_count.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(t.id)}
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

        {/* Create Template Dialog */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Template Product"
          description="Publish a new ATS resume or contract template to the marketplace."
          maxWidth="md"
        >
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <Input
              label="Template Title"
              placeholder="e.g. ATS-Optimised Sustainability Consultant Resume"
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
                placeholder="Details on formatting, industry compliance, and sections..."
                className="w-full rounded-xl border border-kth-slate-200 p-2.5 text-xs text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20"
                required
              />
            </div>
            <Input
              label="Price (INR) — Set 0 for Free"
              type="number"
              value={priceINR}
              onChange={(e) => setPriceINR(e.target.value)}
              required
            />
            <Input
              label="File Download URL"
              placeholder="https://... (Storage download URL)"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-kth-slate-100">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Publish Template
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AdminShell>
  );
};
