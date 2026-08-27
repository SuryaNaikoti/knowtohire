import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { blogService, BlogPost, BlogStatus } from '@/services/blogService';
import {
  Plus,
  Trash2,
  Loader2,
  Edit3,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  ExternalLink,
  Play,
  Pause,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export interface AdminBlogPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminBlogPage: React.FC<AdminBlogPageProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ESG & BRSR Compliance');
  const [authorName, setAuthorName] = useState('KnowToHire Editorial Team');
  const [coverUrl, setCoverUrl] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<BlogStatus>('published');
  const [tagsInput, setTagsInput] = useState('ESG, Compliance');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    const res = await blogService.getBlogPosts({ status: 'all' });
    if (res.data) {
      setPosts(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();

    const handleBlogChanges = () => {
      fetchPosts();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('kth_blog_changed', handleBlogChanges);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_blog_changed', handleBlogChanges);
      }
    };
  }, [fetchPosts]);

  const handleOpenCreateModal = () => {
    setSelectedPost(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCategory('ESG & BRSR Compliance');
    setAuthorName('KnowToHire Editorial Team');
    setCoverUrl('');
    setReadTime('5 min read');
    setIsFeatured(false);
    setStatus('published');
    setTagsInput('ESG, Compliance');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: BlogPost) => {
    setSelectedPost(p);
    setTitle(p.title);
    setSlug(p.slug);
    setExcerpt(p.excerpt);
    setContent(p.content);
    setCategory(p.category);
    setAuthorName(p.author_name || 'KnowToHire Editorial Team');
    setCoverUrl(p.cover_url || '');
    setReadTime(p.read_time || '5 min read');
    setIsFeatured(p.is_featured);
    setStatus(p.status);
    setTagsInput((p.tags || ['ESG', 'Compliance']).join(', '));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setFormError('Please enter Title, Summary Excerpt, and Article Content.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let res;
    if (selectedPost) {
      res = await blogService.updateBlogPost(selectedPost.id, {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim(),
        content: content.trim(),
        category,
        author_name: authorName.trim() || 'KnowToHire Editorial Team',
        cover_url: coverUrl.trim() || undefined,
        read_time: readTime.trim() || '5 min read',
        is_featured: isFeatured,
        status,
        tags: tags.length > 0 ? tags : ['ESG', 'Compliance'],
      });
    } else {
      res = await blogService.createBlogPost({
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim(),
        content: content.trim(),
        category,
        author_name: authorName.trim() || 'KnowToHire Editorial Team',
        cover_url: coverUrl.trim() || undefined,
        read_time: readTime.trim() || '5 min read',
        is_featured: isFeatured,
        status,
        tags: tags.length > 0 ? tags : ['ESG', 'Compliance'],
      });
    }

    setIsSaving(false);

    if (res.error) {
      setFormError(res.error.message);
    } else {
      setIsModalOpen(false);
      fetchPosts();
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: BlogStatus) => {
    setActionLoadingId(id);
    await blogService.updateBlogPostStatus(id, newStatus);
    setActionLoadingId(null);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this article?')) return;
    await blogService.deleteBlogPost(id);
    fetchPosts();
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || p.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI Calculations
  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const totalViews = posts.reduce((sum, p) => sum + (p.view_count || 0), 0);

  const getStatusBadge = (s: BlogStatus) => {
    switch (s) {
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
        return <Badge variant="slate">{s}</Badge>;
    }
  };

  return (
    <AdminShell title="Editorial Blog CMS" currentPath="/admin/blog" onNavigate={onNavigate}>
      <div className="space-y-6 font-sans">
        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Articles</p>
                <h3 className="text-2xl font-extrabold text-kth-slate-900 mt-0.5">{totalCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
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
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Editorial Views</p>
                <h3 className="text-2xl font-extrabold text-cyan-600 mt-0.5">
                  {totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Toolbar & Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search articles by title, slug, excerpt, author, or tags..."
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
                  { value: 'ESG', label: 'ESG & BRSR Compliance' },
                  { value: 'Patent', label: 'Patent & IPR' },
                  { value: 'Environmental Careers', label: 'Environmental Careers' },
                  { value: 'CleanTech', label: 'CleanTech & Energy' },
                  { value: 'Environmental Policy', label: 'Environmental Policy' },
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
              {filteredPosts.length} of {posts.length} Articles
            </span>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreateModal}>
              New Article
            </Button>
          </div>
        </div>

        {/* Articles Table Card */}
        <Card className="p-0 overflow-hidden border-kth-slate-200 bg-white shadow-xs">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500 font-medium">Loading editorial articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-16 text-center text-kth-slate-500 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-kth-slate-400 mx-auto mb-1" />
              <p className="font-bold text-sm text-kth-slate-700">No Articles Found</p>
              <p>Try refining your search keyword or clearing the status/category filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Article Title & Author</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Published Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {filteredPosts.map((p) => (
                    <tr key={p.id} className="hover:bg-kth-slate-50/70 transition-colors">
                      <td className="p-4 max-w-xs sm:max-w-sm">
                        <div className="font-bold text-kth-slate-900 text-sm flex items-center gap-2">
                          {p.title}
                          {p.is_featured && (
                            <Badge variant="indigo" className="text-[10px]">
                              <Sparkles className="w-3 h-3 mr-0.5" /> Featured
                            </Badge>
                          )}
                        </div>
                        <div className="text-kth-slate-500 text-xs line-clamp-1 mt-0.5">{p.excerpt}</div>
                        <div className="flex items-center gap-2 text-[10px] text-kth-slate-400 font-mono mt-1">
                          <span className="text-kth-slate-700 font-medium">By {p.author_name}</span>
                          <span>•</span>
                          <span>/blog/{p.slug}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge variant="cyan" className="text-[10px]">
                          {p.category}
                        </Badge>
                      </td>

                      <td className="p-4">{getStatusBadge(p.status)}</td>

                      <td className="p-4 font-mono font-semibold text-kth-slate-700">
                        {p.view_count.toLocaleString()}
                      </td>

                      <td className="p-4 text-kth-slate-500 font-mono text-[11px]">
                        {p.published_at
                          ? new Date(p.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status !== 'published' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Publish Article to Live Blog"
                              leftIcon={<Play className="w-3.5 h-3.5 text-emerald-600" />}
                              isLoading={actionLoadingId === p.id}
                              onClick={() => handleQuickStatusChange(p.id, 'published')}
                            >
                              Publish
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              title="Revert to Draft"
                              leftIcon={<Pause className="w-3.5 h-3.5 text-amber-600" />}
                              isLoading={actionLoadingId === p.id}
                              onClick={() => handleQuickStatusChange(p.id, 'draft')}
                            >
                              Draft
                            </Button>
                          )}

                          <a
                            href={`/blog/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-kth-slate-200 text-kth-slate-600 hover:text-kth-primary-600 hover:bg-white transition-colors"
                            title="Preview Public Article"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEditModal(p)}
                          >
                            Edit
                          </Button>

                          {p.status !== 'archived' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:bg-rose-50"
                              title="Archive Article"
                              onClick={() => handleDelete(p.id)}
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

        {/* Create / Edit Article Dialog */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => !isSaving && setIsModalOpen(false)}
          title={selectedPost ? 'Edit Editorial Article' : 'Create Editorial Article'}
          description="Draft and publish a new commentary piece, policy update, or industry guide."
          maxWidth="lg"
        >
          <form onSubmit={handleSavePost} className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{formError}</div>
            )}

            <Input
              label="Article Title *"
              placeholder="e.g. Navigating SEBI BRSR Core Mandates: What Listed Entities Need"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Custom URL Slug"
                placeholder="sebi-brsr-core-mandates-guide-2026"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <Input
                label="Author / Bylines"
                placeholder="KnowToHire Regulatory Research Group"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'ESG & BRSR Compliance', label: 'ESG & BRSR Compliance' },
                  { value: 'Patent & IPR', label: 'Patent & IPR' },
                  { value: 'Environmental Careers', label: 'Environmental Careers' },
                  { value: 'CleanTech & Energy', label: 'CleanTech & Energy' },
                  { value: 'Environmental Policy', label: 'Environmental Policy' },
                  { value: 'Corporate Governance', label: 'Corporate Governance' },
                ]}
              />

              <Input
                label="Estimated Read Time"
                placeholder="6 min read"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
              />

              <Select
                label="Publication Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as BlogStatus)}
                options={[
                  { value: 'published', label: 'Published (Live to Blog)' },
                  { value: 'draft', label: 'Draft (Admin Only)' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
                Summary Excerpt *
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief 1-2 sentence overview for cards, meta descriptions, and search previews..."
                className="w-full rounded-xl border border-kth-slate-200 p-3 text-xs text-kth-slate-900 outline-hidden focus:ring-2 focus:ring-kth-primary-500/20 resize-none bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
                Full Article Content (Markdown) *
              </label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full article content in markdown format..."
                className="w-full rounded-xl border border-kth-slate-200 p-3 text-xs font-mono text-kth-slate-900 outline-hidden focus:ring-2 focus:ring-kth-primary-500/20 resize-y bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Cover Image URL"
                placeholder="https://images.unsplash.com/..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />

              <Input
                label="Tags (Comma Separated)"
                placeholder="SEBI BRSR, ESG, Compliance"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
              <input
                type="checkbox"
                id="isFeaturedArticle"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-kth-primary-600 rounded-md border-kth-slate-300 focus:ring-kth-primary-500 cursor-pointer"
              />
              <label htmlFor="isFeaturedArticle" className="text-xs text-kth-slate-700 font-semibold cursor-pointer">
                Feature on Public Homepage & Hero Banner
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-kth-slate-100">
              <Button type="button" variant="secondary" size="sm" disabled={isSaving} onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                {status === 'published' ? 'Publish Article' : 'Save Draft'}
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AdminShell>
  );
};
