import React, { useState, useEffect } from 'react';
import { SectionHeader } from './SectionHeader';
import { TemplateCard } from '@/components/cards/TemplateCard';
import { templateService, MarketplaceTemplate } from '@/services/templateService';
import { ArrowRight, Loader2 } from 'lucide-react';

export const FeaturedTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    templateService.getTemplates({ limit: 4 }).then((res) => {
      if (!isMounted) return;
      if (res.data && res.data.length > 0) {
        setTemplates(res.data);
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 bg-kth-slate-50 border-b border-kth-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Professional Resources"
          badgeVariant="indigo"
          title="Professional Templates, Ready to Use"
          subtitle="ATS-optimized resumes, EIA consultancy agreements, and corporate ESG compliance checklists."
          action={
            <a href="/templates" className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 flex items-center gap-1">
              Explore Template Marketplace <ArrowRight className="w-3.5 h-3.5" />
            </a>
          }
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-kth-primary-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                title={tmpl.title}
                category={tmpl.category}
                format={tmpl.formats[0] || 'DOCX'}
                priceINR={tmpl.price_inr}
                isFree={tmpl.is_free}
                downloads={tmpl.downloads_count}
                onDownload={() => {
                  window.location.href = `/templates/${tmpl.slug || tmpl.id}`;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
