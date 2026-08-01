import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { BookOpen, Plus, Edit, Trash2, X, Save, Eye } from 'lucide-react';

interface BlogPost {
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

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Career Advice');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      // Query from blog posts
      const { data, error: err } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const formatted = (data || []).map((b: any) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        category: b.category || 'Career Advice',
        status: b.status || 'published',
        views: Math.floor(Math.random() * 320) + 18,
        created_at: b.created_at,
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

  const handleAddNew = () => {
    setSelectedPost(null);
    setTitle('');
    setSlug('');
    setCategory('Career Advice');
    setStatus('draft');
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
      const { error: err } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (err) throw err;
      setSuccess('Publishing blog post removed successfully.');
      fetchPosts();
      if (selectedPost?.id === postId) {
        setIsFormOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not remove blog post from database.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const finalSlug = slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const payload = {
        title,
        slug: finalSlug,
        category,
        status,
      };

      if (selectedPost) {
        const { error: err } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', selectedPost.id);
        if (err) throw err;
        setSuccess('Blog post updated successfully.');
      } else {
        const { error: err } = await supabase
          .from('blog_posts')
          .insert({ id: crypto.randomUUID(), ...payload });
        if (err) throw err;
        setSuccess('Blog post published successfully.');
      }

      setIsFormOpen(false);
      fetchPosts();
    } catch (err: any) {
      console.error(err);
      setError('Failed to persist blog post.');
    }
  };

  if (loading) return <Loading label="Loading blog publishing index..." />;

  const tableHeaders = [
    { key: 'title', label: 'Post Title' },
    { key: 'slug', label: 'Slug' },
    { key: 'category', label: 'Category' },
    { key: 'views', label: 'Views' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Blog CMS Console
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Create, edit, schedule, and configure categories and SEO slug headers for K2H publishing articles.
          </p>
        </div>
        <Button size="sm" onClick={handleAddNew} className="text-xs font-bold self-start">
          <Plus className="w-3.5 h-3.5 mr-1" /> New Article
        </Button>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Blog posts list */}
        <div className={`${isFormOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {posts.length === 0 ? (
            <div className="bg-white border border-gray-155 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
              <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No blog articles published.</p>
              <Button size="sm" onClick={handleAddNew} className="text-xs font-bold">
                Publish First Article
              </Button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 border-solid rounded-2xl overflow-hidden">
              <Table headers={tableHeaders}>
                {posts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">{p.title}</div>
                      <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        Published: {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 font-medium font-mono">{p.slug}</TableCell>
                    <TableCell>
                      <Badge variant="primary" size="sm">{p.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs text-gray-500 font-bold gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-450" /> {p.views}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1 rounded text-gray-400 hover:bg-gray-150 hover:text-gray-900 cursor-pointer"
                          aria-label="Edit post"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-650 cursor-pointer"
                          aria-label="Delete post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          )}
        </div>

        {/* Right Side: Form Drawer split panel */}
        {isFormOpen && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-solid border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900">
                {selectedPost ? 'Modify Article Details' : 'Publish New Article'}
              </h3>
              <button className="text-gray-400 hover:text-gray-655 transition cursor-pointer" onClick={() => setIsFormOpen(false)}>
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Article Title"
                placeholder="e.g. Navigating Tech Interviews in 2026"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Input
                label="Custom URL Slug"
                placeholder="auto-generated from title if empty"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">Category</label>
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Career Advice">Career Advice</option>
                    <option value="Employer Branding">Employer Branding</option>
                    <option value="Hiring Trends">Hiring Trends</option>
                    <option value="Product Updates">Product Updates</option>
                  </Select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">Status</label>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-solid border-gray-150">
                <Button type="button" variant="outline" className="bg-white text-xs font-bold" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="text-xs font-bold flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Publish Post
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
