import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/public/SectionHeader';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { knowledgeService, KnowledgeResource } from '@/services/knowledgeService';
import { Search, Loader2, BookOpen, AlertCircle } from 'lucide-react';

export const KnowledgePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchResources = async () => {
      setIsLoading(true);
      setError(null);
      const res = await knowledgeService.getResources({
        search: searchTerm,
        category: selectedCat,
      });

      if (!isMounted) return;
      if (res.error) {
        setError(res.error.message);
      } else {
        setResources(res.data || []);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchResources, 250);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [searchTerm, selectedCat]);

  return (
    <div className="py-12 bg-kth-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Knowledge Ecosystem"
          badgeVariant="cyan"
          title="Knowledge That Helps You Move Forward"
          subtitle="Explore verified e-books, study materials, research papers, and regulatory handbooks."
        />

        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search e-books, research guides, topics..."
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
                { value: 'all', label: 'All Resource Types' },
                { value: 'Environmental', label: 'Environmental Compliance' },
                { value: 'ESG', label: 'ESG & Sustainability' },
                { value: 'Patent', label: 'Patent & IPR' },
                { value: 'E-Book', label: 'E-Books & Handbooks' },
                { value: 'Study', label: 'Study Materials' },
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">Loading verified knowledge resources...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-bold text-sm">Failed to Load Resources</h4>
            <p className="text-xs mt-1 text-red-600">{error}</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white rounded-xl border border-kth-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <BookOpen className="w-10 h-10 text-kth-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-base text-kth-slate-900 mb-1">No Resources Found</h4>
            <p className="text-xs text-kth-slate-500 mb-4">Try adjusting your search terms or selecting a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((res) => (
              <ResourceCard
                key={res.id}
                title={res.title}
                category={res.category}
                author={res.author || 'KnowToHire Regulatory Team'}
                format={res.format}
                pageCount={res.pageCount || 48}
                rating={res.rating}
                downloadCount={res.downloads_count}
                isFree={res.is_free ?? true}
                priceINR={res.price_inr}
                onDownload={() => {
                  window.location.href = `/knowledge/${res.slug || res.id}`;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
