import React, { useState, useEffect } from 'react';
import { SectionHeader } from './SectionHeader';
import { BlogCard } from '@/components/cards/BlogCard';
import { blogService, BlogPost } from '@/services/blogService';
import { ArrowRight, Loader2 } from 'lucide-react';

export const FeaturedArticles: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    blogService.getBlogPosts({ isFeatured: true, limit: 3 }).then((res) => {
      if (!isMounted) return;
      if (res.data && res.data.length > 0) {
        setPosts(res.data);
      } else {
        // Fallback: fetch any 3 posts if no explicit is_featured
        blogService.getBlogPosts({ limit: 3 }).then((fallbackRes) => {
          if (!isMounted) return;
          if (fallbackRes.data) setPosts(fallbackRes.data);
        });
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-10 sm:py-14 md:py-16 bg-kth-slate-50 border-b border-kth-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Editorial & Insights"
          badgeVariant="indigo"
          title="Insights for Your Next Move"
          subtitle="Expert analysis on SEBI BRSR compliance, clean energy patents, and career progression strategies."
          action={
            <a href="/blog" className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 flex items-center gap-1">
              Read All Articles <ArrowRight className="w-3.5 h-3.5" />
            </a>
          }
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-kth-primary-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post) => (
              <div
                key={post.slug || post.id}
                onClick={() => {
                  window.location.href = `/blog/${post.slug || post.id}`;
                }}
                className="cursor-pointer"
              >
                <BlogCard
                  title={post.title}
                  excerpt={post.excerpt}
                  category={post.category}
                  author={post.author_name || 'KnowToHire Editorial Team'}
                  readingTime={post.read_time}
                  date={new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
