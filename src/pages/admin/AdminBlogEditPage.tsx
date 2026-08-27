import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { blogService, BlogPost } from '@/services/blogService';
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  Eye,
  FileText,
  Sparkles,
  Tag,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export interface AdminBlogEditPageProps {
  blogId?: string;
  onNavigate?: (path: string) => void;
}

export const AdminBlogEditPage: React.FC<AdminBlogEditPageProps> = ({ blogId: propBlogId, onNavigate }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = propBlogId || paramId;
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [authorName, setAuthorName] = useState('KnowToHire Editorial Team');
  const [category, setCategory] = useState('ESG & BRSR Compliance');
  const [readTime, setReadTime] = useState('6 min read');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      blogService.getBlogPostBySlug(id, { requirePublished: false }).then((res) => {
        if (res.data) {
          setTitle(res.data.title);
          setSlug(res.data.slug);
          setAuthorName(res.data.author_name);
          setCategory(res.data.category);
          setReadTime(res.data.read_time);
          setIsFeatured(res.data.is_featured);
          setTagsInput(res.data.tags?.join(', ') || '');
          setExcerpt(res.data.excerpt || '');
          setContent(res.data.content);
        } else {
          setError('Article not found or failed to load.');
        }
        setIsLoading(false);
      });
    }
  }, [id, isEditing]);

  const handleSave = async (publishStatus?: 'published' | 'draft') => {
    if (!title.trim()) {
      setError('Article title is required.');
      return;
    }
    if (!content.trim()) {
      setError('Article content is required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (isEditing && id) {
        const updatePayload: Partial<BlogPost> = {
          title,
          slug: slug || undefined,
          author_name: authorName,
          category,
          read_time: readTime,
          is_featured: isFeatured,
          tags: tagsArray,
          excerpt,
          content,
        };
        if (publishStatus) {
          updatePayload.status = publishStatus;
        }

        const res = await blogService.updateBlogPost(id, updatePayload);
        if (res.error) {
          setError(res.error.message);
        } else {
          setSuccessMessage('Article updated successfully.');
          setTimeout(() => {
            handleBack();
          }, 600);
        }
      } else {
        const createPayload = {
          title,
          slug: slug || undefined,
          author_name: authorName,
          category,
          read_time: readTime,
          is_featured: isFeatured,
          tags: tagsArray,
          excerpt,
          content,
          status: publishStatus || 'published',
        };

        const res = await blogService.createBlogPost(createPayload);
        if (res.error) {
          setError(res.error.message);
        } else {
          setSuccessMessage('Article created and published successfully.');
          setTimeout(() => {
            handleBack();
          }, 600);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save article.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/admin/blog');
    } else {
      navigate('/admin/blog');
    }
  };

  return (
    <AdminShell
      title={isEditing ? 'Edit Editorial Article' : 'Write Editorial Article'}
      currentPath="/admin/blog"
      onNavigate={onNavigate}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog Management</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all inline-flex items-center gap-1.5 ${
                previewMode
                  ? 'bg-kth-primary-50 border-kth-primary-200 text-kth-primary-700'
                  : 'bg-white border-kth-slate-200 text-kth-slate-600 hover:bg-kth-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{previewMode ? 'Exit Preview' : 'Live Preview'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {isLoading ? (
          <Card className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">Loading article studio...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Content Form / Preview */}
            <div className="lg:col-span-8 space-y-6">
              {previewMode ? (
                <Card className="p-8 space-y-6 bg-white border-kth-slate-200 shadow-sm">
                  <div className="space-y-3 border-b border-kth-slate-100 pb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-kth-primary-600 bg-kth-primary-50 px-2.5 py-1 rounded-md border border-kth-primary-100">
                      {category}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-kth-slate-900 leading-tight">
                      {title || 'Untitled Article'}
                    </h1>
                    <div className="flex items-center gap-4 text-xs text-kth-slate-500 font-medium pt-2">
                      <span>By {authorName}</span>
                      <span>•</span>
                      <span>{readTime}</span>
                    </div>
                  </div>

                  {excerpt && (
                    <p className="text-sm text-kth-slate-600 italic border-l-2 border-kth-primary-500 pl-4 py-1">
                      {excerpt}
                    </p>
                  )}

                  <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {content || 'Article content markdown preview will appear here.'}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 sm:p-8 space-y-6 bg-white border-kth-slate-200 shadow-sm">
                  <div className="space-y-4">
                    <Input
                      label="Article Title *"
                      placeholder="e.g. Navigating SEBI BRSR Core Mandates: What Listed Entities Need in FY 2026-27"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-kth-slate-700">
                        Executive Excerpt / Abstract
                      </label>
                      <textarea
                        rows={3}
                        placeholder="A concise briefing summarizing key regulatory findings and career progression roadmaps..."
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-kth-slate-700">
                          Article Body (Markdown Supported) *
                        </label>
                        <span className="text-[11px] text-kth-slate-400 font-mono">
                          {content.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                      <textarea
                        rows={16}
                        placeholder="Write the comprehensive analysis, statutory breakdown, or research briefing here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        className="w-full px-4 py-3 text-xs sm:text-sm font-mono rounded-xl border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent leading-relaxed"
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar Metadata & Publishing Studio */}
            <div className="lg:col-span-4 space-y-6">
              {/* Publishing Controls Card */}
              <Card className="p-6 space-y-4 bg-white border-kth-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-kth-slate-100 pb-3">
                  <Send className="w-4 h-4 text-kth-primary-600" />
                  Publishing Controls
                </h3>

                <div className="space-y-3 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full text-xs font-bold bg-kth-primary-600 hover:bg-kth-primary-700 text-white shadow-xs"
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    isLoading={isSaving}
                    onClick={() => handleSave('published')}
                  >
                    {isEditing ? 'Update & Publish' : 'Publish to Platform'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full text-xs font-semibold border-kth-slate-200"
                    leftIcon={<Save className="w-4 h-4 text-kth-slate-500" />}
                    isLoading={isSaving}
                    onClick={() => handleSave('draft')}
                  >
                    Save as Draft
                  </Button>
                </div>
              </Card>

              {/* Taxonomy & Metadata Card */}
              <Card className="p-6 space-y-4 bg-white border-kth-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-kth-slate-100 pb-3">
                  <FileText className="w-4 h-4 text-kth-primary-600" />
                  Metadata & Taxonomy
                </h3>

                <div className="space-y-4 text-xs">
                  <Input
                    label="Custom URL Slug"
                    placeholder="sebi-brsr-core-mandates-guide-2026"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />

                  <Input
                    label="Author / Bylines"
                    placeholder="KnowToHire Editorial Team"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />

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
                    ]}
                  />

                  <Input
                    label="Reading Time"
                    placeholder="e.g. 6 min read"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-kth-slate-700 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-kth-slate-400" />
                      <span>Focus Tags (comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="BRSR Core, ESG Assurance, SEBI Mandates"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Featured Article Toggle */}
                  <div className="pt-2 border-t border-kth-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-kth-slate-900">Featured Analysis</span>
                      <span className="block text-[11px] text-kth-slate-500">Show in homepage hero showcase</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-kth-primary-600 rounded-md border-kth-slate-300 focus:ring-kth-primary-500"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};
