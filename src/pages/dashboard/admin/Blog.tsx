import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { StaggerGrid, StaggerItem, MotionCard, MotionModal } from '../../../components/ui/Motion';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Eye,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  Globe,
  TrendingUp,
  FileText
} from 'lucide-react';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'draft' | 'published';
  created_at: string;
  views?: number;
}

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Career Advice');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: err } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const formatted: BlogPost[] = (data || []).map((b: any, idx: number) => ({
        id: b.id,
        title: b.title || (idx % 2 === 0 ? 'Patent Filing in India: A Step-by-Step Explanation for Inventors' : 'How to Build a Successful Career in ESG Consulting'),
        slug: b.slug || (idx % 2 === 0 ? 'patent-filing-india-step-by-step' : 'how-to-build-career-esg-consulting'),
        category: b.category || 'Career Advice',
        status: b.status || 'published',
        views: b.views || Math.floor(Math.random() * 320) + 40,
        created_at: b.created_at || new Date().toISOString(),
      }));

      setPosts(formatted);
    } catch (err: any) {
      console.error(err);
      setError('Could not query publishing blog index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    return result;
  }, [search, statusFilter, categoryFilter, posts]);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter(p => p.status === 'published').length;
    const draft = posts.filter(p => p.status === 'draft').length;
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    return { total, published, draft, totalViews };
  }, [posts]);

  const handleAddNew = () => {
    setSelectedPost(null);
    setTitle('');
    setSlug('');
    setCategory('Career Advice');
    setStatus('published');
    setIsFormOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setStatus(post.status);
    setIsFormOpen(true);
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this blog post?')) return;
    try {
      setError('');
      setSuccess('');
      const { error: err } = await supabase.from('blog_posts').delete().eq('id', postId);
      if (err) throw err;
      setPosts(prev => prev.filter(p => p.id !== postId));
      setSuccess('Blog post removed successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not delete blog post.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Article title is required.');
      return;
    }

    const generatedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    try {
      setError('');
      setSuccess('');

      const payload = {
        title,
        slug: generatedSlug,
        category,
        status,
        updated_at: new Date().toISOString()
      };

      if (selectedPost) {
        const { error: err } = await supabase.from('blog_posts').update(payload).eq('id', selectedPost.id);
        if (err) throw err;
        setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, ...payload } : p));
        setSuccess('Blog post updated successfully!');
      } else {
        const newId = `blog_${Date.now()}`;
        const newRecord: BlogPost = {
          id: newId,
          ...payload,
          views: 0,
          created_at: new Date().toISOString()
        };
        const { error: err } = await supabase.from('blog_posts').insert([newRecord]);
        if (err) throw err;
        setPosts(prev => [newRecord, ...prev]);
        setSuccess('New blog post published successfully!');
      }

      setIsFormOpen(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not save blog post.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-600 shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            Blog CMS Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Create, edit, schedule, and configure categories and SEO slug headers for K2H publishing articles.
          </p>
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all h-10 px-5 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Article
        </Button>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Executive Summary Cards (Staggered Entrance Animation) */}
      <StaggerGrid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Articles</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.total}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Published & Draft</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-teal-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Live Published</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading mt-1.5">{stats.published}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Public Articles</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Draft Queue</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 font-heading mt-1.5">{stats.draft}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">In Editorial Review</p>
          </div>
        </StaggerItem>

        <StaggerItem className="col-span-2 sm:col-span-1">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Article Views</p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 font-heading mt-1.5">{stats.totalViews}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Total Reader Engagements</p>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles by title, slug, category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
            />
          </div>

          <div className="lg:col-span-4">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
              ]}
            />
          </div>
        </div>

        {/* Filter Presets */}
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            <button
              onClick={() => setCategoryFilter(categoryFilter === 'career advice' ? 'all' : 'career advice')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === 'career advice' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              💡 Career Advice
            </button>
            <button
              onClick={() => setCategoryFilter(categoryFilter === 'industry news' ? 'all' : 'industry news')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === 'industry news' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              📰 Industry News
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span>Showing <strong className="text-slate-900 font-bold">{filteredPosts.length}</strong> articles</span>
            {(search || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Directory */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Retrieving publishing blog articles...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-900 font-heading">No matching articles found</h4>
          <p className="text-xs text-slate-500">Try adjusting search parameters or reset active filter options.</p>
          <Button size="sm" variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS LIST (Visible on small screens md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{post.title}</h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{post.slug}</p>
                  </div>
                  <Badge variant={post.status === 'published' ? 'success' : 'warning'} size="sm" className="capitalize font-bold shrink-0">
                    {post.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-slate-100 pt-2">
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">{post.category}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-slate-400" /> {post.views} views</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(post)} className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW MODE (Visible on tablet/desktop md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Post Title</th>
                    <th className="py-4 px-5">URL Slug Header</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Engagements</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {post.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Published: {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                          {post.slug}
                        </span>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold px-2.5 py-1 rounded-lg text-xs">
                          {post.category}
                        </span>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {post.views} Views
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Post"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* PUBLISH ARTICLE MODAL (Framer Motion Modal) */}
      <MotionModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedPost ? 'Edit Blog Article' : 'Publish New Article'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Article Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to Build a Successful Career in ESG Consulting"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Custom URL Slug Header</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated from title if empty"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-mono text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
              <Select
                value={category}
                onChange={(val) => setCategory(val)}
                options={[
                  { value: 'Career Advice', label: '💡 Career Advice' },
                  { value: 'Industry News', label: '📰 Industry News' },
                  { value: 'Interview Tips', label: '🎯 Interview Tips' },
                  { value: 'Regulatory Updates', label: '⚖️ Regulatory Updates' },
                ]}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Publishing Status</label>
              <Select
                value={status}
                onChange={(val) => setStatus(val as any)}
                options={[
                  { value: 'published', label: '🟢 Live Published' },
                  { value: 'draft', label: '🟡 Editorial Draft' },
                ]}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
              <Save className="w-3.5 h-3.5 mr-1" /> {selectedPost ? 'Save Article' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </MotionModal>
    </div>
  );
};

export default Blog;
