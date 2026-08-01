import React, { useState } from 'react';
import { useDocumentIntelligence } from '../../../context/DocumentIntelligenceContext';
import type { ResumePersona } from '../../../types/candidate.types';
import { Sparkles, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/Button';

export const PersonaResumeGeneratorStudio: React.FC = () => {
  const { selectedPersona, setSelectedPersona, generatePersonaResume } = useDocumentIntelligence();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const personas: { id: ResumePersona; label: string; desc: string }[] = [
    { id: 'Software Engineer', label: 'Software Engineer', desc: 'Focuses on full-stack architecture, React, Node.js, and latency metrics' },
    { id: 'Data Engineer', label: 'Data Engineer', desc: 'Highlights data pipelines, SQL, PyTorch, ETL, and cloud data warehouses' },
    { id: 'Product Manager', label: 'Product Manager', desc: 'Emphasizes roadmap execution, user growth, features, and business impact' },
    { id: 'Research CV', label: 'Research CV', desc: 'Highlights publications, patents, academic credentials, and methodologies' },
    { id: 'Executive Resume', label: 'Executive Resume', desc: 'Focuses on strategic leadership, team size, P&L, and enterprise growth' },
    { id: 'ESG Specialist', label: 'ESG Specialist', desc: 'Emphasizes environmental compliance, EIA, ISO 14001, and auditing' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    const doc = await generatePersonaResume(selectedPersona);
    setIsGenerating(false);
    setLastGenerated(doc.title);
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Multi-Persona Resume Generator Studio</span>
        </h3>
        <p className="text-xs text-slate-500">
          Generate targeted, ATS-optimized resume variants automatically from your single source of career evidence.
        </p>
      </div>

      {/* Persona Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {personas.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPersona(p.id)}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
              selectedPersona === p.id
                ? 'bg-emerald-50/70 border-emerald-500 text-slate-900 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{p.label}</span>
                {selectedPersona === p.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button & Confirmation */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-600">
          Selected Target Persona: <span className="font-bold text-emerald-700">{selectedPersona}</span>
        </div>

        <Button
          onClick={handleGenerate}
          isLoading={isGenerating}
          className="w-full sm:w-auto px-6 h-11 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>{isGenerating ? 'Synthesizing Resume Persona...' : `Generate ${selectedPersona} Variant`}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {lastGenerated && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Successfully generated "{lastGenerated}" variant! Added to CDIC repository.</span>
        </div>
      )}
    </div>
  );
};
