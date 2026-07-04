import React, { useState } from 'react';
import { mockBlogs } from '../../constants/mockData';
import type { BlogPost } from '../../constants/mockData';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState, BlogCardSkeleton } from '../../components/ui/Skeleton';
import { ArrowLeft, Clock, Bookmark, Share2, BookOpen, Sparkles } from 'lucide-react';

/* ── Reusable Dot Grid Background ── */
const DotGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotgrid-blog" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid-blog)" />
    </svg>
  </div>
);

export const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedBlogId, setExpandedBlogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const categories = ['All', 'Careers', 'Recruiting', 'Finance', 'ESG & Sustainability'];

  const filteredBlogs = mockBlogs.filter((post: BlogPost) => {
    return selectedCategory === 'All' || post.category === selectedCategory || (selectedCategory === 'ESG & Sustainability' && post.category === 'ESG');
  });

  const featuredPost = mockBlogs.find((post: BlogPost) => post.isFeatured);

  return (
    <div className="bg-slate-50/30 flex-1 w-full min-h-screen animate-fade-in-up">
      {/* Editorial Header Panel */}
      {!expandedBlogId && (
        <div className="relative bg-white border-b border-slate-150 py-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
          <DotGrid className="text-slate-400 opacity-25" />
          
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-6 relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Insights & Trends</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-heading text-slate-900 tracking-tight leading-none">
              KnowToHire <span className="kth-gradient-text">Insights</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
              Expert guides, recruitment trends, and career acceleration strategies written by global professionals.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 w-full flex flex-col space-y-10">
        
        {/* Categories filter tabs */}
        {!expandedBlogId && (
          <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-1 select-none scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); simulateLoading(); }}
                className={`px-5 py-3 text-xs font-bold shrink-0 transition-all border-b-2 cursor-pointer whitespace-nowrap focus:ring-2 focus:ring-emerald-500/20
                  ${selectedCategory === cat ? 'border-emerald-650 text-emerald-655' : 'border-transparent text-slate-400 hover:text-slate-900'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Featured Post Card */}
        {selectedCategory === 'All' && featuredPost && !expandedBlogId && (
          <Card className="border border-slate-200 hover:shadow-premium hover:-translate-y-1 transition-all overflow-hidden group bg-white shadow-sm rounded-[24px]">
            <CardContent className="p-0 flex flex-col lg:flex-row text-left">
              <div className="lg:w-1/2 aspect-[16/10] lg:aspect-auto bg-slate-100 overflow-hidden relative border-b lg:border-b-0 lg:border-r border-slate-100">
                <img
                  src={featuredPost.coverUrl}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest text-white bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-md shadow-lg select-none">
                  Featured Article
                </span>
              </div>
              <div className="lg:w-1/2 p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg">
                    {featuredPost.category}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug font-heading">
                    {featuredPost.title}
                  </h2>
                  <p className="text-sm text-slate-500 font-normal leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-5 flex-wrap gap-4 mt-auto">
                  <div className="flex items-center gap-3">
                    <img
                      src={featuredPost.authorAvatar}
                      alt={featuredPost.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-none">{featuredPost.authorName}</div>
                      <div className="text-[10px] text-slate-450 mt-1 flex items-center gap-2 font-semibold">
                        <span>{featuredPost.publishedAt}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs font-bold border-slate-200 h-10 rounded-xl hover:bg-slate-50" onClick={() => setExpandedBlogId(featuredPost.id)}>
                    Read Full Article
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expanded Blog Reader View */}
        {expandedBlogId ? (
          <article className="bg-white border border-slate-200 rounded-[24px] p-8 md:p-12 shadow-sm max-w-3xl mx-auto w-full space-y-8 text-left relative overflow-hidden">
            <div className="absolute top-4 right-4 text-emerald-400/35">
              <Sparkles className="w-6 h-6" />
            </div>

            {/* Back button */}
            <div className="flex justify-between items-center pb-5 border-b border-slate-100">
              <button
                onClick={() => setExpandedBlogId(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer bg-transparent border-none"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Insights
              </button>
              <div className="flex items-center gap-3 text-slate-400">
                <button className="hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-none" aria-label="Share article"><Share2 className="w-4 h-4" /></button>
                <button className="hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-none" aria-label="Bookmark article"><Bookmark className="w-4 h-4" /></button>
              </div>
            </div>

            {(() => {
              const blog = mockBlogs.find((b: BlogPost) => b.id === expandedBlogId);
              if (!blog) return null;
              return (
                <div className="space-y-6">
                  {/* Article cover banner */}
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                    <img src={blog.coverUrl} alt={blog.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg">
                        {blog.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {blog.readTime} read
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 font-heading tracking-tight leading-snug">
                      {blog.title}
                    </h1>
                  </div>

                  {/* Author Details Card */}
                  <div className="flex items-center gap-3 border-t border-b border-slate-100 py-4 text-xs font-medium">
                    <img src={blog.authorAvatar} alt={blog.authorName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-none">{blog.authorName}</div>
                      <div className="text-[10px] text-slate-450 mt-1 font-semibold">Contributor, KnowToHire Lab • Published {blog.publishedAt}</div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="prose max-w-none text-sm text-slate-600 leading-relaxed font-normal space-y-5 whitespace-pre-line">
                    {blog.content}
                  </div>
                </div>
              );
            })()}
          </article>
        ) : (
          /* Blog grid lists */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <>
                <BlogCardSkeleton />
                <BlogCardSkeleton />
                <BlogCardSkeleton />
              </>
            ) : filteredBlogs.length > 0 ? (
              filteredBlogs.map((post) => (
                <Card
                  key={post.id}
                  hoverEffect
                  className="hover:shadow-premium hover:-translate-y-1.5 transition-all flex flex-col group bg-white shadow-sm border border-slate-200 rounded-[24px] overflow-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  {/* Cover visual */}
                  <div className="aspect-[16/10] bg-slate-100 overflow-hidden shrink-0 border-b border-slate-150">
                    <img
                      src={post.coverUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mt-1 font-heading leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-normal line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-4 mt-auto">
                      <div className="flex items-center gap-2.5">
                        <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <div>
                          <div className="text-[10px] font-bold text-slate-800 leading-none">{post.authorName}</div>
                          <div className="text-[8px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                            <span>{post.publishedAt}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="font-bold text-xs py-1.5 px-3 border-slate-200 rounded-lg hover:bg-slate-50" onClick={() => setExpandedBlogId(post.id)}>
                        Read
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState 
                  title="No Articles Found"
                  description="Try adjusting your filter options to see other insights."
                  actionText="Reset Filters"
                  onAction={() => setSelectedCategory('All')}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
