import React, { useState, useEffect } from 'react';
import { SectionHeader } from './SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { blogService, BlogPost } from '@/services/blogService';
import { ArrowRight, Loader2, Clock, BookOpen, CheckCircle2, UserCheck } from 'lucide-react';

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
        // Fallback: fetch any posts
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

  const featuredPost = posts[0];

  return (
    <section className="py-10 sm:py-14 md:py-16 bg-kth-slate-50 border-b border-kth-slate-200 font-sans">
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
        ) : featuredPost ? (
          <div
            onClick={() => {
              window.location.href = `/blog/${featuredPost.slug || featuredPost.id}`;
            }}
            className="cursor-pointer group bg-white rounded-2xl border border-kth-slate-200/90 hover:border-kth-primary-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Left Column: Dark Editorial Visual Banner */}
              <div className="lg:col-span-5 bg-gradient-to-br from-kth-slate-950 via-kth-slate-900 to-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-kth-primary-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="cyan" className="text-[10px] font-bold">
                      FEATURED ANALYSIS
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-cyan-200 font-mono bg-white/10 px-2.5 py-1 rounded-md backdrop-blur-xs">
                      <Clock className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{featuredPost.read_time || '6 min read'}</span>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-6">
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-cyan-300 flex items-center justify-center mb-3 shadow-inner">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs text-cyan-300 font-semibold tracking-wider uppercase block">
                      SEBI BRSR Compliance
                    </span>
                    <p className="text-xs text-kth-slate-300 mt-2 leading-relaxed font-normal">
                      A comprehensive breakdown of mandatory ESG disclosures, reasonable assurance mandates, and sustainability audit frameworks for Indian corporates.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-kth-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-kth-slate-300">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    {featuredPost.author_name || 'KnowToHire Editorial Team'}
                  </span>
                  <span className="font-mono text-[11px]">
                    {new Date(featuredPost.published_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Right Column: Editorial Body & Core Takeaways */}
              <div className="lg:col-span-7 p-6 sm:p-8 sm:p-10 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" className="text-xs font-semibold">
                      {featuredPost.category || 'Regulatory Compliance & ESG'}
                    </Badge>
                    <span className="text-xs text-kth-slate-400">•</span>
                    <span className="text-xs text-kth-slate-500 font-medium">Industry Briefing</span>
                  </div>

                  <h3 className="font-display text-lg sm:text-2xl font-bold text-kth-slate-900 group-hover:text-kth-primary-600 transition-colors leading-snug">
                    {featuredPost.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-kth-slate-600 leading-relaxed font-normal">
                    {featuredPost.excerpt}
                  </p>

                  {/* Core Takeaways Checklist */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2 text-xs text-kth-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Scope 1 & 2 GHG Protocol carbon accounting requirements for top listed companies.</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-kth-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Value-chain ESG disclosures and third-party reasonable assurance roadmaps.</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-kth-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Emerging career opportunities in statutory sustainability reporting & assurance.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-kth-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-kth-primary-600 group-hover:text-kth-primary-700 flex items-center gap-1.5">
                    Read Full Editorial Analysis <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <Button variant="primary" size="sm" className="font-bold text-xs">
                    Read Article
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-kth-slate-200 p-8 text-center text-xs text-kth-slate-500">
            No editorial articles available at this moment.
          </div>
        )}
      </div>
    </section>
  );
};
