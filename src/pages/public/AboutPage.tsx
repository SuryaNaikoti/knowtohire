import React from 'react';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Target, Zap, Building2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 bg-kth-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Careers, Knowledge & Research SaaS"
          badgeVariant="indigo"
          title="About KnowToHire"
          subtitle="A unified cloud software platform connecting talent discovery, specialized knowledge resources, and empirical research tools in India."
          align="center"
        />

        <Card className="p-8 mb-8 space-y-6 leading-relaxed text-sm text-kth-slate-700">
          <div>
            <h3 className="font-display font-bold text-xl text-kth-slate-900 mb-2">A Unified Careers, Knowledge & Research Platform</h3>
            <p>
              KnowToHire is an IT & Software platform operating under the Software as a Service (SaaS) model. We unify career management, specialized domain knowledge, and technical research into a single cloud ecosystem. The platform enables professionals to build profiles and prepare for interviews, employers to manage requisitions and screen candidates through self-serve ATS pipelines, creators to publish structured templates, and practitioners to access research handbooks in environmental sustainability (SPCB/BRSR) and patent/IPR domains.
            </p>
            <p className="mt-2 text-xs text-kth-slate-500">
              KnowToHire is an IT software and digital content platform. We are not a manpower staffing agency or placement consultancy, and we do not charge recruitment commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-kth-slate-200">
            <div>
              <h4 className="font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-kth-primary-600" /> Careers Software
              </h4>
              <p className="text-xs text-kth-slate-500">
                Self-serve candidate profiles, ATS resume parsing tools, interview tracking, and direct application submission software.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> Employer ATS
              </h4>
              <p className="text-xs text-kth-slate-500">
                Cloud job management, customizable visual Kanban applicant pipelines, candidate evaluation, and team collaboration dashboards.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-2">
                <Zap className="w-5 h-5 text-kth-accent-cyan" /> Knowledge & Research
              </h4>
              <p className="text-xs text-kth-slate-500">
                Specialized study material, SPCB compliance guides, BRSR handbooks, patent filing whitepapers, and verified document templates.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-kth-accent-emerald" /> Creator Studio
              </h4>
              <p className="text-xs text-kth-slate-500">
                Digital publishing tools allowing domain educators and creators to publish career templates and track royalty analytics.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
