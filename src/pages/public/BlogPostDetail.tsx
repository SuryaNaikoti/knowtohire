import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogService } from '../../lib/services/blogService';
import type { BlogPost as BlogPostType } from '../../lib/services/blogService';
import { analyticsService } from '../../lib/services/analyticsService';
import DOMPurify from 'dompurify';
import { Clock, ArrowLeft, Eye, Heart, Share2, BookOpen, Tag, Calendar, ChevronRight } from 'lucide-react';

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SKELETON_WIDTHS = ['90%', '85%', '95%', '80%', '88%', '75%'];
const BlogPostSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-72 bg-slate-200 rounded-2xl mb-8" />
    <div className="max-w-3xl mx-auto px-4">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
      <div className="h-10 bg-slate-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-8" />
      {SKELETON_WIDTHS.map((w, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded mb-3" style={{ width: w }} />
      ))}
    </div>
  </div>
);

// ── Related Card ──────────────────────────────────────────────────────────────
const RelatedCard: React.FC<{ post: any }> = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group block bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 overflow-hidden"
  >
    {post.featured_image && (
      <img src={post.featured_image} alt={post.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
    )}
    <div className="p-4">
      {post.category && (
        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">{post.category}</span>
      )}
      <h3 className="mt-1 text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2">{post.title}</h3>
      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
        <Clock className="w-3 h-3" />
        {post.read_time_minutes} min read
      </div>
    </div>
  </Link>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPostType | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  const loadPost = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await blogService.getPostBySlug(slug);
      setPost(data);

      // Track analytics
      analyticsService.track({
        event_type: 'blog_view',
        event_category: 'blog',
        entity_type: 'blog_post',
        entity_id: data.id,
      });

      // Load related
      if (data.category) {
        const rel = await blogService.getRelatedPosts(data.id, data.category, 3);
        setRelated(rel ?? []);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { loadPost(); }, [loadPost]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post?.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
    if (post) {
      analyticsService.track({ event_type: 'blog_share', event_category: 'blog', entity_id: post.id });
    }
  };

  const handleLike = () => {
    setLiked((prev) => !prev);
    // Optimistic UI — in production this would call an API
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-12"><BlogPostSkeleton /></div>;

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Post not found</h2>
        <p className="text-slate-500 mb-6">{error ?? 'This article may have been moved or removed.'}</p>
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>
      </div>
    );
  }

  return (
    <article className="bg-white min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(16,185,129,0.15),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            {post.category && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-emerald-400">{post.category}</span>
              </>
            )}
          </nav>

          {post.category && (
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest rounded-full border border-emerald-500/30 mb-4">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-slate-300 leading-relaxed mb-8">{post.excerpt}</p>
          )}

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.avatar_url ? (
                  <img src={post.author.avatar_url} alt={post.author.full_name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                    {post.author.full_name?.[0]}
                  </div>
                )}
                <span className="text-white font-medium">{post.author.full_name}</span>
              </div>
            )}
            {post.published_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.published_at)}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.read_time_minutes} min read
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {(post.view_count ?? 0).toLocaleString()} views
            </div>
          </div>
        </div>
      </div>

      {/* Featured image */}
      {post.featured_image && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 mb-10">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-xl"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12">
          {/* Article body */}
          <div>
            {/* Prose content */}
            {post.content ? (
              <div
                className="prose prose-slate prose-emerald max-w-none prose-headings:font-bold prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } }) }}
              />
            ) : (
              <div className="text-slate-500 italic">Content coming soon.</div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action bar */}
            <div className="mt-8 flex items-center gap-4 pt-6 border-t border-slate-100">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium ${
                  liked
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
                {(post.like_count ?? 0) + (liked ? 1 : 0)}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 transition-all text-sm font-medium"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <Link
                to="/blog"
                className="ml-auto flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Author card */}
              {post.author && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">About the Author</p>
                  <div className="flex items-center gap-3">
                    {post.author.avatar_url ? (
                      <img src={post.author.avatar_url} alt={post.author.full_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                        {post.author.full_name?.[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{post.author.full_name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                <p className="text-sm font-semibold text-slate-700 mb-3">Found this helpful?</p>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share Article
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => <RelatedCard key={r.id} post={r} />)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};

export default BlogPostDetail;
