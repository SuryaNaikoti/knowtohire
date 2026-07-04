import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { projectsService } from '../../../lib/services/projectsService';
import type { CandidateProject } from '../../../lib/services/projectsService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { Modal } from '../../../components/ui/Modal';
import { ProjectForm } from '../../../components/dashboard/ProjectForm';
import { FolderGit2, Plus, Trash2, Edit2, ExternalLink, GitFork, Star } from 'lucide-react';

export const Projects: React.FC = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<CandidateProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CandidateProject | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    if (!profile) return;
    try {
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

  const handleAdd = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project: CandidateProject) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!profile || !window.confirm('Remove this project from your portfolio?')) return;
    setDeleting(projectId);
    try {
      await projectsService.deleteProject(profile.id, projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleFormSubmit = async (data: Omit<CandidateProject, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    if (!profile) return;
    await projectsService.upsertProject({
      ...data,
      candidate_id: profile.id
    } as any);
  };

  const handleSaved = () => {
    setIsModalOpen(false);
    fetchData();
  };

  if (loading) return <Loading label="Loading projects..." />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-primary" /> Projects & Portfolio
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Add side projects, open-source work, and academic details to demonstrate your skills.
          </p>
        </div>
        <Button onClick={handleAdd} className="font-bold text-xs shrink-0 flex items-center gap-1.5 w-full md:w-auto justify-center">
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <FolderGit2 className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm font-bold text-gray-600">No projects added yet.</p>
          <p className="text-xs text-gray-400 font-medium">Adding projects shows practical hands-on application of your skills to employers.</p>
          <Button onClick={handleAdd} className="text-xs font-bold">
            Add First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProject ? 'Edit Project' : 'Add Project'}
        size="md"
      >
        {profile && (
          <ProjectForm
            candidateId={profile.id}
            existingProject={selectedProject}
            onSubmit={handleFormSubmit}
            onSaved={handleSaved}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};
export default Projects;
