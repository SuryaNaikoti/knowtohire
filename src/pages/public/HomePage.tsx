import React from 'react';
import { HeroSection } from '@/components/public/HeroSection';
import { CategoryGrid } from '@/components/public/CategoryGrid';
import { FeaturedJobs } from '@/components/public/FeaturedJobs';
import { FeaturedResources } from '@/components/public/FeaturedResources';
import { FeaturedTemplates } from '@/components/public/FeaturedTemplates';
import { CareerGrowthSection } from '@/components/public/CareerGrowthSection';
import { EmployerCTA } from '@/components/public/EmployerCTA';
import { FeaturedArticles } from '@/components/public/FeaturedArticles';
import { FinalCTA } from '@/components/public/FinalCTA';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-kth-slate-50 flex flex-col font-sans">
      <HeroSection />
      <CategoryGrid />
      <FeaturedJobs />
      <FeaturedResources />
      <FeaturedTemplates />
      <CareerGrowthSection />
      <EmployerCTA />
      <FeaturedArticles />
      <FinalCTA />
    </div>
  );
};
