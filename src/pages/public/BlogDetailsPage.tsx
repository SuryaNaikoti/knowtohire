import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { blogService, BlogPost } from '@/services/blogService';
import { Clock, Calendar, User, ArrowLeft, Loader2, AlertCircle, Eye } from 'lucide-react';

export interface BlogDetailsPageProps {
  slug?: string;
}

export const BlogDetailsPage: React.FC<BlogDetailsPageProps> = ({ slug }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeSlug = slug || window.location.pathname.replace('/blog/', '');

  useEffect(() => {
    let isMounted = true;
    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      const res = await blogService.getBlogPostBySlug(activeSlug, { requirePublished: true });
      if (!isMounted) return;
      if (res.error) {
        setError(res.error.message);
      } else {
        setPost(res.data);
      }
      setIsLoading(false);
    };

    fetchPost();
    return () => {
      isMounted = false;
    };
  }, [activeSlug]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-kth-slate-50 min-h-screen">
        <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
        <p className="text-xs text-kth-slate-500 font-medium">Loading article content...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-20 bg-kth-slate-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-kth-slate-200 text-center shadow-xs">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold text-kth-slate-900 mb-1">Article Not Found</h2>
          <p className="text-xs text-kth-slate-500 mb-6">{error || 'The requested article could not be found.'}</p>
          <Button variant="primary" onClick={() => (window.location.href = '/blog')}>
            Return to Editorial Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-kth-slate-50 min-h-screen">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => (window.location.href = '/blog')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-kth-slate-600 hover:text-kth-primary-600 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Editorial Blog
        </button>

        <Card className="p-8 md:p-12">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="cyan">{post.category}</Badge>
            {post.is_featured && <Badge variant="emerald">Featured</Badge>}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-kth-slate-900 mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-xs text-kth-slate-500 border-b border-kth-slate-200 pb-6 mb-8 flex-wrap">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-kth-primary-600" />
              <span>
                <strong className="text-kth-slate-800">{post.author_name || 'KnowToHire Editorial Team'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{post.read_time}</span>
            </div>
            {post.view_count !== undefined && post.view_count > 0 && (
              <div className="flex items-center gap-1.5 text-kth-slate-400 font-mono">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.view_count.toLocaleString()} views</span>
              </div>
            )}
          </div>

          {post.cover_url && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-xs max-h-96">
              <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose max-w-none text-kth-slate-700 leading-relaxed space-y-4 text-sm md:text-base">
            <p className="font-semibold text-kth-slate-900 text-lg leading-snug">
              {post.excerpt}
            </p>
            <div className="whitespace-pre-line text-kth-slate-800 leading-relaxed">
              {post.content}
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-kth-slate-200">
              <h4 className="font-bold text-xs text-kth-slate-500 uppercase tracking-wider mb-2">Related Tags</h4>
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag, idx) => (
                  <Badge key={idx} variant="slate" className="normal-case text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </article>
    </div>
  );
};
