import React, { useState, useEffect } from 'react';
import { SectionHeader } from './SectionHeader';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { knowledgeService, KnowledgeResource } from '@/services/knowledgeService';
import { ArrowRight, Loader2 } from 'lucide-react';

export const FeaturedResources: React.FC = () => {
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    knowledgeService.getResources({ limit: 4 }).then((res) => {
      if (!isMounted) return;
      if (res.data && res.data.length > 0) {
        setResources(res.data);
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 bg-white border-b border-kth-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Knowledge Ecosystem"
          badgeVariant="cyan"
          title="Knowledge That Moves You Forward"
          subtitle="Empirical research papers, regulatory handbooks, and SPCB compliance e-books authored by domain experts."
          action={
            <a href="/knowledge" className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 flex items-center gap-1">
              Browse Knowledge Hub <ArrowRight className="w-3.5 h-3.5" />
            </a>
          }
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-kth-primary-600 animate-spin" />
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
    </section>
  );
};
