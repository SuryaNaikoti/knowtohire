import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

  const handleNavigateEdit = (p: BlogPost) => {
    if (onNavigate) {
      onNavigate(`/admin/blog/${p.id}/edit`);
    } else {
      window.location.href = `/admin/blog/${p.id}/edit`;
    }
  };

  const handleToggleFeatured = async (p: BlogPost) => {
    setActionLoadingId(p.id);
    await blogService.updateBlogPost(p.id, { is_featured: !p.is_featured });
    setActionLoadingId(null);
    fetchPosts();
  };

  const handleToggleStatus = async (p: BlogPost) => {
    setActionLoadingId(p.id);
    const newStatus: BlogStatus = p.status === 'published' ? 'draft' : 'published';
    await blogService.updateBlogPostStatus(p.id, newStatus);
    setActionLoadingId(null);
    fetchPosts();
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to archive article "${title}"?`)) {
      setActionLoadingId(id);
      await blogService.deleteBlogPost(id);
      setActionLoadingId(null);
      fetchPosts();
    }
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
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                if (onNavigate) onNavigate('/admin/blog/new');
                else window.location.href = '/admin/blog/new';
              }}
            >
              New Article
            </Button>
          </div>
        </div>

        {/* Articles Table Card */}
        <Card className="p-0 overflow-hidden border-kth-slate-200 bg-white shadow-xs">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500 font-medium">Loading editorial articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">
              <AlertCircle className="w-8 h-8 text-kth-slate-300 mx-auto mb-2" />
              No editorial articles found matching current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Article Title & Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Featured</th>
                    <th className="p-4">Published Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100 font-normal">
                  {filteredPosts.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => handleNavigateEdit(p)}
                      className="hover:bg-kth-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 max-w-sm">
                        <div className="space-y-1">
                          <span className="font-bold text-kth-slate-900 block group-hover:text-kth-primary-600 transition-colors line-clamp-1">
                            {p.title}
                          </span>
                          <span className="text-[11px] text-kth-slate-500 line-clamp-1 block">
                            {p.excerpt}
                          </span>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[10px] text-kth-slate-400 font-mono">
                              Slug: /blog/{p.slug}
                            </span>
                            <span className="text-[10px] text-kth-slate-400">•</span>
                            <span className="text-[10px] text-kth-slate-400">{p.read_time || '5 min read'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge variant="indigo" className="text-[10px] font-semibold">
                          {p.category}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <Badge
                          variant={
                            p.status === 'published' ? 'emerald' : p.status === 'draft' ? 'amber' : 'slate'
                          }
                          className="capitalize text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </td>

                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            p.is_featured
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                              : 'bg-white border-kth-slate-200 text-kth-slate-400 hover:text-kth-slate-600'
                          }`}
                          title={p.is_featured ? 'Remove from featured showcase' : 'Make featured article'}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </td>

                      <td className="p-4 text-kth-slate-500 font-mono text-[11px]">
                        {p.published_at
                          ? new Date(p.published_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs font-semibold"
                            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => handleNavigateEdit(p)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={p.status === 'published' ? 'outline' : 'primary'}
                            size="sm"
                            className="text-xs font-semibold"
                            isLoading={actionLoadingId === p.id}
                            onClick={() => handleToggleStatus(p)}
                          >
                            {p.status === 'published' ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs font-semibold p-2"
                            isLoading={actionLoadingId === p.id}
                            onClick={() => handleDeletePost(p.id, p.title)}
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>
    </AdminShell>
  );
};
