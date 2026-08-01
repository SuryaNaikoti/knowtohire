import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { projectsService } from '../../../lib/services/projectsService';
import type { CandidateProject } from '../../../lib/services/projectsService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { FolderGit2, Plus, Trash2, Edit2, ExternalLink, GitFork, Star, Save, X } from 'lucide-react';
import { ProfileDraftService } from '../../../lib/services/ProfileDraftService';
import { analyticsService } from '../../../lib/services/analyticsService';

export const Projects: React.FC = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<CandidateProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Form split panel states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CandidateProject | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form fields state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const data = await projectsService.getProjects(profile.id);
      // Sort projects: featured first, then newest
      const sorted = [...data].sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
      setProjects(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  // Load draft from centralized ProfileDraftService
  useEffect(() => {
    if (!profile) return;
    const draft = ProfileDraftService.getDraft('projects', profile.id);
    if (draft) {
      setTitle(draft.title || '');
      setDescription(draft.description || '');
      setTechStack(draft.techStack || '');
      setProjectUrl(draft.projectUrl || '');
      setGithubUrl(draft.githubUrl || '');
      setIsFeatured(draft.isFeatured ?? false);
      setSelectedProject(draft.selectedProject || null);
      setIsFormOpen(true);
    }
  }, [profile]);

  // Centralized Autosave Trigger
  useEffect(() => {
    if (!profile || !isFormOpen) return;
    ProfileDraftService.saveDraft('projects', profile.id, {
      title,
      description,
      techStack,
      projectUrl,
      githubUrl,
      isFeatured,
      selectedProject
    });
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Autosave Triggered', moduleName: 'projects' }
    });
  }, [profile, isFormOpen, title, description, techStack, projectUrl, githubUrl, isFeatured, selectedProject]);

  const handleAdd = () => {
    setSelectedProject(null);
    setTitle('');
    setDescription('');
    setTechStack('');
    setProjectUrl('');
    setGithubUrl('');
    setIsFeatured(false);
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleEdit = (project: CandidateProject) => {
    setSelectedProject(project);
    setTitle(project.title);
    setDescription(project.description || '');
    setTechStack(project.tech_stack || '');
    setProjectUrl(project.project_url || '');
    setGithubUrl(project.github_url || '');
    setIsFeatured(project.is_featured || false);
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    if (profile) {
      ProfileDraftService.clearDraft('projects', profile.id);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!profile || !window.confirm('Remove this project from your portfolio?')) return;
    setDeleting(projectId);
    setError('');
    setSuccess('');
    try {
      await projectsService.deleteProject(profile.id, projectId);
      setSuccess('Project removed successfully.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Project Deleted', recordId: projectId }
      });
      if (selectedProject?.id === projectId) {
        setIsFormOpen(false);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Could not remove project.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Validation checks
    if (!title.trim() || !description.trim()) {
      setError('Project title and description are required.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Missing fields' }
      });
      return;
    }

    if (projectUrl.trim() && !projectUrl.startsWith('http://') && !projectUrl.startsWith('https://')) {
      setError('Please enter a valid live demo URL starting with http:// or https://');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Invalid Live URL' }
      });
      return;
    }

    if (githubUrl.trim() && !githubUrl.startsWith('http://') && !githubUrl.startsWith('https://')) {
      setError('Please enter a valid GitHub URL starting with http:// or https://');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Invalid GitHub URL' }
      });
      return;
    }

    // Duplicate project check
    const isDuplicate = projects.some(p =>
      p.id !== selectedProject?.id &&
      p.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
    if (isDuplicate) {
      setError('A project with this title already exists in your portfolio.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Duplicate entry' }
      });
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        id: selectedProject?.id,
        candidate_id: profile.id,
        title: title.trim(),
        description: description.trim(),
        tech_stack: techStack.trim(),
        project_url: projectUrl.trim() || undefined,
        github_url: githubUrl.trim() || undefined,
        is_featured: isFeatured,
      };

      await projectsService.upsertProject(payload as any);
      setSuccess('Project saved successfully.');
      setIsFormOpen(false);
      ProfileDraftService.clearDraft('projects', profile.id);

      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: selectedProject ? 'Project Edited' : 'Project Added' }
      });

      fetchData();
    } catch (err: any) {
      console.error(err);
      setError('Could not write project details to Supabase.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Save Failed', reason: err.message }
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && projects.length === 0) return <Loading label="Loading projects..." />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Redesigned Breadcrumb + Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-primary" /> Projects & Portfolio
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Add side projects, open-source work, and achievements to demonstrate your skills.
          </p>
        </div>
        {!isFormOpen && (
          <Button onClick={handleAdd} className="font-bold text-xs shrink-0 flex items-center gap-1.5 w-full md:w-auto justify-center">
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        )}
      </div>

      {error && <Alert type="error" title="Error Details">{error}</Alert>}
      {success && <Alert type="success" title="Action Completed">{success}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Projects Cards */}
        <div className={`${isFormOpen ? 'lg:col-span-7' : 'lg:col-span-12'} grid grid-cols-1 gap-6`}>
          {projects.length === 0 ? (
            <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <FolderGit2 className="w-7 h-7 text-primary" />
              </div>
              <p className="text-sm font-bold text-gray-600">No projects added yet.</p>
              <p className="text-xs text-gray-400 font-medium">Adding projects shows practical hands-on application of your skills to employers.</p>
              <Button onClick={handleAdd} className="text-xs font-bold mx-auto">
                Add First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className={`bg-white hover:shadow-md transition-all ${project.is_featured ? 'border-l-4 border-l-amber-400' : ''}`}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                          <FolderGit2 className="w-5 h-5 text-primary" />
                        </div>
                        {project.is_featured && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-solid border-amber-100">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Featured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-primary transition cursor-pointer"
                          aria-label="Edit project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={deleting === project.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                          aria-label="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-heading font-black text-gray-900 text-sm leading-tight">{project.title}</h3>
                      {project.description && (
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>

                    {project.tech_stack && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack.split(',').map((tech) => {
                          const name = tech.trim();
                          if (!name) return null;
                          return (
                            <span key={name} className="bg-gray-50 text-gray-650 text-[10px] font-bold px-2 py-0.5 rounded-md border border-solid border-gray-100">
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t border-solid border-gray-50">
                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:underline"
                        >
                          <GitFork className="w-3.5 h-3.5" /> Repository
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Split View Compact Form Panel */}
        {isFormOpen && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-solid border-gray-100 pb-3">
              <h3 className="font-heading font-black text-gray-900 text-sm">
                {selectedProject ? 'Modify Project' : 'Create Project'}
              </h3>
              <button
                onClick={handleCancelForm}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <Input
                label="Project Title"
                required
                maxLength={255}
                value={title}
                onChange={(e: any) => setTitle(e.target.value)}
                placeholder="e.g. AI Resume Parser, Carbon Tracker Dashboard"
              />

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 tracking-wide">
                  Project Description
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[100px] outline-none"
                  placeholder="Describe what this project does..."
                  maxLength={2000}
                  value={description}
                  onChange={(e: any) => setDescription(e.target.value)}
                />
              </div>

              <Input
                label="Tech Stack (comma-separated)"
                maxLength={255}
                value={techStack}
                onChange={(e: any) => setTechStack(e.target.value)}
                placeholder="e.g. React, TypeScript, Supabase, TailwindCSS"
              />

              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Live Demo URL"
                  type="url"
                  maxLength={500}
                  value={projectUrl}
                  onChange={(e: any) => setProjectUrl(e.target.value)}
                  placeholder="https://your-project.com"
                />
                <Input
                  label="GitHub Repository URL"
                  type="url"
                  maxLength={500}
                  value={githubUrl}
                  onChange={(e: any) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 border-solid rounded-lg px-4 py-3">
                <input
                  type="checkbox"
                  id="is-featured"
                  checked={isFeatured}
                  onChange={(e: any) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
                />
                <label htmlFor="is-featured" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Feature this project (appears at the top of your portfolio)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-solid border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}
                  disabled={saving}
                  size="sm"
                  className="text-xs font-bold bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={saving}
                  size="sm"
                  className="text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
