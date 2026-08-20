import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/public/SectionHeader';
import { BlogCard } from '@/components/cards/BlogCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { blogService, BlogPost } from '@/services/blogService';
import { Search, Loader2, BookOpen, AlertCircle } from 'lucide-react';

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
        category: selectedCat,
      });

      if (!isMounted) return;
      if (res.error) {
        setError(res.error.message);
      } else {
        setPosts(res.data || []);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchPosts, 250);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [searchTerm, selectedCat]);

  return (
    <div className="py-12 bg-kth-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Editorial & Insights"
          badgeVariant="indigo"
          title="KnowToHire Editorial Blog"
          subtitle="Expert commentary on SEBI BRSR compliance, CleanTech patent innovation, and career growth."
        />

        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search articles, ESG updates, guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Environmental', label: 'Environmental Careers' },
                { value: 'ESG', label: 'ESG & BRSR Compliance' },
                { value: 'Patent', label: 'Patent & IPR' },
                { value: 'CleanTech', label: 'CleanTech & Energy' },
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">Loading editorial articles...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-bold text-sm">Failed to Load Blog Posts</h4>
            <p className="text-xs mt-1 text-red-600">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-kth-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <BookOpen className="w-10 h-10 text-kth-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-base text-kth-slate-900 mb-1">No Articles Found</h4>
            <p className="text-xs text-kth-slate-500 mb-4">Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
};
