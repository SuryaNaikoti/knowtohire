import React, { useState } from 'react';
import { useCompetencyEngine } from '../../../context/CompetencyEngineContext';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Plus, Trash2, FolderGit2, ExternalLink, Tag, ShieldCheck } from 'lucide-react';

export const PortfolioEvidenceRepositoryEditor: React.FC = () => {
  const { portfolioItems, addPortfolioItem, deletePortfolioItem } = useCompetencyEngine();

  const [title, setTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState<'Project' | 'Case Study' | 'GitHub Repos' | 'Patent' | 'Research Paper' | 'Publication' | 'Video Demo' | 'Open Source'>('Project');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [businessImpact, setBusinessImpact] = useState('');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillsDemonstrated, setSkillsDemonstrated] = useState<string[]>([]);

  const handleAddSkillTag = () => {
    if (!skillInput.trim()) return;
    setSkillsDemonstrated([...skillsDemonstrated, skillInput.trim()]);
    setSkillInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await addPortfolioItem({
      title,
      evidence_type: evidenceType,
      project_url: projectUrl,
      github_url: githubUrl,
      business_impact: businessImpact,
      description,
      skills_demonstrated: skillsDemonstrated,
      verification_status: 'Self-Verified',
    });

    setTitle('');
    setProjectUrl('');
    setGithubUrl('');
    setBusinessImpact('');
    setDescription('');
    setSkillsDemonstrated([]);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-emerald-600" />
          <span>Add Portfolio Evidence Proof</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Evidence Title *"
            placeholder="e.g. Real-Time Analytics Dashboard or ESG Air Quality Patent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Evidence Type</label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="Project">Live Project / Prototype</option>
              <option value="Case Study">Executive Case Study</option>
              <option value="GitHub Repos">GitHub Repository</option>
              <option value="Patent">Patent / Innovation Record</option>
              <option value="Research Paper">Research Paper / Publication</option>
              <option value="Video Demo">Video Demo Presentation</option>
              <option value="Open Source">Open Source Contribution</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Live Project / Demo URL"
            placeholder="https://myproject.com"
            leftIcon={<ExternalLink className="w-4 h-4" />}
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
          />

          <Input
            label="GitHub Repository URL"
            placeholder="https://github.com/username/repo"
            leftIcon={<FolderGit2 className="w-4 h-4" />}
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </div>

        <Input
          label="Quantifiable Business Impact"
          placeholder="e.g. Reduced processing latency by 45%, Serving 100K daily active users"
          value={businessImpact}
          onChange={(e) => setBusinessImpact(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Project Description & Architecture Scope</label>
          <textarea
            rows={3}
            placeholder="Describe technical implementation, architecture decisions, and domain challenges solved..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
        </div>

        {/* Skills Demonstrated Linking */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Link Demonstrated Competencies</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. React, Node.js, AWS, EIA"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="flex-1 px-3.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
            <Button
              type="button"
              onClick={handleAddSkillTag}
              className="px-3 h-8 text-xs font-bold bg-slate-900 text-white rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" /> Link Skill
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {skillsDemonstrated.map((sk, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-md flex items-center gap-1">
                {sk}
                <button type="button" onClick={() => setSkillsDemonstrated(skillsDemonstrated.filter((_, i) => i !== idx))}>&times;</button>
              </span>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Save Portfolio Evidence Proof</span>
        </Button>
      </form>

      {/* Portfolio Evidence List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Evidence Repository ({portfolioItems.length})
        </h4>

        {portfolioItems.map((item) => (
          <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{item.title}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full border border-slate-200">
                    {item.evidence_type}
                  </span>
                </h4>
                {item.business_impact && (
                  <p className="text-xs font-semibold text-emerald-600">Impact: {item.business_impact}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Proof
                </span>
                <button
                  type="button"
                  onClick={() => deletePortfolioItem(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700">{item.description}</p>

            {item.skills_demonstrated && item.skills_demonstrated.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {item.skills_demonstrated.map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                    {sk}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
