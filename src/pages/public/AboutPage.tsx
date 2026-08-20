import React from 'react';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Target, Zap } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 bg-kth-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Our Mission & Ecosystem"
          badgeVariant="indigo"
          title="About KnowToHire"
          subtitle="Connecting talent with career opportunities, verified study material, and professional document templates in India."
          align="center"
        />

        <Card className="p-8 mb-8 space-y-6 leading-relaxed text-sm text-kth-slate-700">
          <div>
            <h3 className="font-display font-bold text-xl text-kth-slate-900 mb-2">Know More. Hire Better. Grow Faster.</h3>
            <p>
              KnowToHire was founded to solve a fundamental disconnect in the Indian professional ecosystem: the fragmentation between career discovery, skill building resources, and recruitment workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-kth-slate-200">
            <div>
              <h4 className="font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-kth-primary-600" /> Career Discovery
              </h4>
              <p className="text-xs text-kth-slate-500">Connecting candidates with verified employers in sustainability, ESG, and clean technology.</p>
            </div>
            <div>
              <h4 className="font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-2">
                <Zap className="w-5 h-5 text-kth-accent-cyan" /> Knowledge Hub
              </h4>
              <p className="text-xs text-kth-slate-500">Providing SPCB compliance guides, BRSR handbooks, and empirical research papers.</p>
            </div>
            <div>
              <h4 className="font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-kth-accent-emerald" /> Resource Marketplace
              </h4>
              <p className="text-xs text-kth-slate-500">Delivering lawyer-vetted MSAs and ATS-friendly resume templates.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
