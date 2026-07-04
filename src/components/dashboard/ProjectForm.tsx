import React, { useState } from 'react';
import type { CandidateProject } from '../../../lib/services/projectsService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';

interface ProjectFormProps {
  candidateId: string;
  existingProject?: CandidateProject | null;
  onSaved: () => void;
  onCancel: () => void;
  onSubmit: (data: Omit<CandidateProject, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<void>;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  candidateId,
  existingProject,
  onSaved,
  onCancel,
  onSubmit,
}) => {
  const [title, setTitle] = useState(existingProject?.title || '');
  const [description, setDescription] = useState(existingProject?.description || '');
  const [techStack, setTechStack] = useState(existingProject?.tech_stack || '');
  const [projectUrl, setProjectUrl] = useState(existingProject?.project_url || '');
  const [githubUrl, setGithubUrl] = useState(existingProject?.github_url || '');
  const [isFeatured, setIsFeatured] = useState(existingProject?.is_featured || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        id: existingProject?.id,
        candidate_id: candidateId,
        title: title.trim(),
        description: description.trim(),
        tech_stack: techStack.trim(),
        project_url: projectUrl.trim() || undefined,
        github_url: githubUrl.trim() || undefined,
        is_featured: isFeatured,
      });
      onSaved();
    } catch (err) {
      console.error(err);
      setError('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      {error && <Alert type="error" title="Error" className="text-xs">{error}</Alert>}

      <Input
        label="Project Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. AI Resume Parser, Carbon Tracker Dashboard"
      />

      <div className="flex flex-col space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 tracking-wide">
          Project Description
        </label>
        <textarea
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[100px] outline-none"
          placeholder="Describe what this project does and your role in it..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Input
        label="Tech Stack (comma-separated)"
        value={techStack}
        onChange={(e) => setTechStack(e.target.value)}
        placeholder="e.g. React, TypeScript, Supabase, TailwindCSS"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Live Demo URL"
          type="url"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
          placeholder="https://your-project.com"
        />
        <Input
          label="GitHub Repository URL"
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username/repo"
        />
      </div>

      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 border-solid rounded-lg px-4 py-3">
        <input
          type="checkbox"
          id="is-featured"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
        />
        <label htmlFor="is-featured" className="text-xs font-semibold text-gray-700 cursor-pointer">
          Feature this project (appears at the top of your portfolio)
        </label>
      </div>

      <div className="flex gap-3 pt-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="text-xs font-bold"
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={saving} className="text-xs font-bold">
          {existingProject ? 'Update Project' : 'Add Project'}
        </Button>
      </div>
    </form>
  );
};
