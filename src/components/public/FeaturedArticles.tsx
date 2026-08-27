import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeader } from './SectionHeader';
import { blogService, BlogPost } from '@/services/blogService';
import {
  ArrowRight,
  Loader2,
  Clock,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Compass,
} from 'lucide-react';

export const FeaturedArticles: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeaturedPosts = useCallback(() => {
    let isMounted = true;
    blogService.getBlogPosts({ isFeatured: true, limit: 3 }).then((res) => {
      if (!isMounted) return;
      if (res.data && res.data.length > 0) {
        setPosts(res.data);
      } else {
        // Fallback: fetch any published post
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

  useEffect(() => {
    const cleanup = fetchFeaturedPosts();

    const handleBlogChanged = () => {
      fetchFeaturedPosts();
    };

    window.addEventListener('kth_blog_changed', handleBlogChanged);
    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('kth_blog_changed', handleBlogChanged);
    };
  }, [fetchFeaturedPosts]);

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);

  const handleNavigate = (slugOrId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.location.href = `/blog/${slugOrId}`;
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-kth-slate-50 via-white to-kth-slate-50 border-b border-kth-slate-200/80 font-sans relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badgeText="Editorial & Insights"
          badgeVariant="indigo"
          title="Insights for Your Next Move"
          subtitle="Expert analysis on SEBI BRSR compliance, clean energy patents, and career progression strategies."
          action={
            <a
              href="/blog"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-kth-slate-200 text-xs font-semibold text-kth-primary-600 hover:text-kth-primary-700 hover:border-kth-primary-300 hover:bg-kth-primary-50/50 shadow-xs transition-all duration-150"
            >
              <span>Read All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          }
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin" />
            <p className="text-xs text-kth-slate-500 font-medium">Loading latest editorial analysis...</p>
          </div>
        ) : featuredPost ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Main Featured Hero Card (Left, Col-Span 7 or 8) */}
            <div
              onClick={() => handleNavigate(featuredPost.slug || featuredPost.id)}
              className={`cursor-pointer group relative rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                secondaryPosts.length > 0 ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'
              }`}
            >
              {/* Vibrant ambient gradients */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

              <div className="p-6 sm:p-8 md:p-10 relative z-10 space-y-6">
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                      FEATURED ANALYSIS
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      {featuredPost.category || 'ESG & BRSR Compliance'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{featuredPost.read_time || '6 min read'}</span>
                  </div>
                </div>

                {/* Title & Excerpt */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-white group-hover:text-cyan-200 transition-colors duration-200 leading-tight tracking-tight">
                    {featuredPost.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                {/* Key Insights / Analytical Takeaways Box */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md space-y-2.5">
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Key Focus Takeaways</span>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-200">
                    {featuredPost.tags && featuredPost.tags.length > 0 ? (
                      featuredPost.tags.slice(0, 3).map((tag, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Core focus area: Key insights, requirements & methodology on <strong className="text-white font-semibold">{tag}</strong></span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Scope 1 & 2 GHG Protocol carbon accounting requirements for top listed entities.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Value-chain ESG disclosures and third-party reasonable assurance roadmaps.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Emerging career opportunities in statutory sustainability reporting & compliance.</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 sm:px-8 md:px-10 py-5 bg-slate-950/70 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {(featuredPost.author_name || 'KTH')[0]}
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-white">
                      {featuredPost.author_name || 'KnowToHire Regulatory Research Group'}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-mono">
                      Published {new Date(featuredPost.published_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleNavigate(featuredPost.slug || featuredPost.id, e)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold shadow-md hover:from-cyan-400 hover:to-indigo-500 hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                >
                  <span>Read Full Article</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Secondary Insights & Briefs Column (Right, Col-Span 5 or 4) */}
            {secondaryPosts.length > 0 && (
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-4 sm:gap-5">
                {secondaryPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handleNavigate(post.slug || post.id)}
                    className="cursor-pointer group bg-white rounded-2xl p-5 sm:p-6 border border-kth-slate-200/90 hover:border-kth-primary-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-kth-primary-700 bg-kth-primary-50 px-2.5 py-0.5 rounded-md border border-kth-primary-100">
                          {post.category || 'Career Intelligence'}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-kth-slate-400 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{post.read_time || '5 min'}</span>
                        </div>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-kth-slate-900 group-hover:text-kth-primary-600 transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h4>

                      <p className="text-xs text-kth-slate-600 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-kth-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-kth-slate-400 font-medium">
                        {new Date(post.published_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="font-bold text-kth-primary-600 group-hover:text-kth-primary-700 inline-flex items-center gap-1">
                        Read <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}

                {/* Mini Resource / Newsletter Card */}
                <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 rounded-2xl p-5 border border-indigo-100/80 shadow-xs flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                      <Compass className="w-4 h-4 text-kth-primary-600" />
                      <span>Explore Knowledge Hub</span>
                    </div>
                    <p className="text-[11px] text-kth-slate-600 leading-tight">
                      Access guides, compliance handbooks, and interview frameworks.
                    </p>
                  </div>
                  <a
                    href="/blog"
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-kth-primary-600 hover:bg-kth-primary-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
                  >
                    View All
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-kth-slate-200 p-12 text-center text-sm text-kth-slate-500 max-w-lg mx-auto shadow-xs">
            <BookOpen className="w-8 h-8 text-kth-slate-400 mx-auto mb-3" />
            <h4 className="font-bold text-kth-slate-800 text-base mb-1">No Articles Published Yet</h4>
            <p className="text-xs text-kth-slate-500">
              Check back soon for latest editorial briefings, ESG frameworks, and market research.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
