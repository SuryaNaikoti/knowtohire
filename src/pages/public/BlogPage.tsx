import React, { useState, useEffect } from 'react';
import { BlogCard } from '@/components/cards/BlogCard';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { blogService, BlogPost } from '@/services/blogService';
import { Search, Loader2, BookOpen, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

const BLOG_CATEGORIES = [
  { id: 'all', label: 'All Articles' },
  { id: 'ESG', label: 'ESG & BRSR' },
  { id: 'Environmental', label: 'Environmental Careers' },
  { id: 'CleanTech', label: 'CleanTech & Climate' },
  { id: 'Patent', label: 'Patent & IPR Law' },
  { id: 'Industry Trends', label: 'Industry Trends' },
];

export const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      const res = await blogService.getBlogPosts({
        search: searchTerm,
        category: selectedCat !== 'all' ? selectedCat : undefined,
      });

      if (!isMounted) return;
      if (res.error) {
        setError(res.error.message);
      } else {
        setPosts(res.data || []);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchPosts, 200);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [searchTerm, selectedCat]);

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const standardPosts = posts.length > 1 ? posts.slice(1) : [];

  const handlePostClick = (post: BlogPost) => {
    const target = `/blog/${post.slug || post.id}`;
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="py-8 sm:py-12 bg-kth-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. WordPress / Medium Style Editorial Header */}
        <div className="mb-8 text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Editorial & Thought Leadership
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-kth-slate-900 tracking-tight">
            The Sustainability Journal
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-kth-slate-600 max-w-2xl leading-relaxed">
            In-depth analysis, regulatory compliance breakdowns, and hiring insights written by environmental practitioners and climate analysts.
          </p>
        </div>

        {/* 2. Category Filter Pills + Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCat === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-kth-slate-600 border border-kth-slate-200 hover:border-kth-slate-300 hover:text-kth-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80">
            <Input
              placeholder="Search articles & topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
              className="bg-white text-xs"
            />
          </div>
        </div>

        {/* 3. Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">Curating editorial journal...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-800 max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h4 className="font-bold text-sm">Failed to Load Blog Posts</h4>
            <p className="text-xs mt-1 text-rose-600">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-kth-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <BookOpen className="w-10 h-10 text-kth-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-base text-kth-slate-900 mb-1">No Articles Found</h4>
            <p className="text-xs text-kth-slate-500 mb-4">Try adjusting your keyword or selecting another category.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Hero Article Card (WordPress magazine layout) */}
            {featuredPost && (
              <div
                onClick={() => handlePostClick(featuredPost)}
                className="bg-white rounded-3xl border border-kth-slate-200/90 shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group grid grid-cols-1 lg:grid-cols-12"
              >
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20">
                        Featured Story
                      </span>
                      <Badge variant="indigo" className="text-[10px] uppercase">
                        {featuredPost.category}
                      </Badge>
                    </div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-kth-slate-900 group-hover:text-amber-700 transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-kth-slate-600 leading-relaxed line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-kth-slate-100 text-xs text-kth-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        {(featuredPost.author_name || 'KTH')[0]}
                      </div>
                      <div>
                        <span className="font-bold text-kth-slate-900 block">{featuredPost.author_name || 'Editorial Board'}</span>
                        <span className="text-[11px] text-kth-slate-400">
                          {new Date(featuredPost.published_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-8 flex flex-col justify-end text-white relative min-h-[260px]">
                  <div className="relative z-10 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block font-bold">
                      Verified Field Analysis
                    </span>
                    <h3 className="font-display font-bold text-lg text-white">
                      Strategic ESG Frameworks & Indian Industrial Regulations
                    </h3>
                    <p className="text-xs text-slate-300">
                      Essential background reading for environmental executives and ESG compliance leads.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Article Grid (3 columns) */}
            {standardPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standardPosts.map((post) => (
                  <div
                    key={post.slug || post.id}
                    onClick={() => handlePostClick(post)}
                    className="cursor-pointer"
                  >
                    <BlogCard
                      title={post.title}
                      excerpt={post.excerpt}
                      category={post.category}
                      author={post.author_name || 'KnowToHire Editorial Team'}
                      readingTime={post.read_time}
                      date={new Date(post.published_at).toLocaleDateString('en-IN', {
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
        )}
      </div>
    </div>
  );
};
