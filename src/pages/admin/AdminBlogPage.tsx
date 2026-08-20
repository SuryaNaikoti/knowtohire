import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { blogService, BlogPost } from '@/services/blogService';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export const AdminBlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Environmental Policy');
  const [coverUrl, setCoverUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    const res = await blogService.getBlogPosts();
    if (res.data) {
      setPosts(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) return;
    setIsSaving(true);

    await blogService.createBlogPost({
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim(),
      content: content.trim(),
      category,
      cover_url: coverUrl.trim() || undefined,
      is_featured: isFeatured,
    });

    setIsSaving(false);
    setIsModalOpen(false);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCoverUrl('');
    setIsFeatured(false);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    await blogService.deleteBlogPost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AdminShell title="Editorial Blog CMS" currentPath="/admin/blog">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div>
            <h2 className="font-display text-base font-bold text-kth-slate-900">Articles, Market Insights & Policy Briefings</h2>
            <p className="text-xs text-kth-slate-500">Publish expert articles on SEBI BRSR, CleanTech patents, and carbon regulations.</p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            New Article
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Loading editorial posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">No blog articles found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Article Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Published Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {posts.map((p) => (
                    <tr key={p.id} className="hover:bg-kth-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-kth-slate-900 flex items-center gap-2">
                          {p.title}
                          {p.is_featured && <Badge variant="emerald">Featured</Badge>}
                        </div>
                        <div className="text-kth-slate-500 text-[11px] font-mono">/blog/{p.slug}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="cyan">{p.category}</Badge>
                      </td>
                      <td className="p-4 font-mono text-kth-slate-600">
                        {p.view_count?.toLocaleString() || 0}
                      </td>
                      <td className="p-4 text-kth-slate-500 font-mono text-[11px]">
                        {new Date(p.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(p.id)}
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

        {/* Create Article Dialog */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Editorial Article"
          description="Draft and publish a new commentary piece or market analysis."
          maxWidth="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <Input
              label="Article Title"
              placeholder="e.g. Navigating SEBI BRSR Core Mandate for Listed Entities"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Custom URL Slug (Optional)"
                placeholder="sebi-brsr-core-mandate-guide"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <Input
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Environmental Policy"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">Lead Excerpt</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief high-level summary displayed in card previews..."
                className="w-full rounded-xl border border-kth-slate-200 p-2.5 text-xs text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">Article Body Content</label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full article content in markdown or formatted text..."
                className="w-full rounded-xl border border-kth-slate-200 p-2.5 text-xs text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20 resize-none font-mono"
                required
              />
            </div>
            <Input
              label="Cover Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featCheck"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-kth-primary-600 focus:ring-kth-primary-500"
              />
              <label htmlFor="featCheck" className="text-xs font-semibold text-kth-slate-700">
                Mark as Featured Editorial on Homepage
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-kth-slate-100">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Publish Article
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AdminShell>
  );
};
