'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { PROJECT_CATEGORIES, PROJECT_STATUSES, getCategoryInfo, getStatusInfo } from '../../lib/constants';
import ProjectImageUpload from './ProjectImageUpload';
import { getProjectImages, type ProjectImage } from '../../lib/imageUpload';

interface ProjectData {
  id?: string;
  title: string;
  description: string;
  long_description: string;
  category: string;
  status: string;
  start_date: string;
  end_date: string;
  year: number;
  featured: boolean;
  project_url: string;
  github_url: string;
  demo_url: string;
  primary_tech: string;
  tech_stack: string[];
  commits_count: string;
  team_size: string;
  duration: string;
  features: string[];
  challenges_solved: string[];
  gradient_from: string;
  gradient_to: string;
  thumbnail_url: string;
  sort_order: number;
}

const initialProjectData: ProjectData = {
  title: '',
  description: '',
  long_description: '',
  category: 'web',
  status: 'Completed',
  start_date: '',
  end_date: '',
  year: new Date().getFullYear(),
  featured: false,
  project_url: '',
  github_url: '',
  demo_url: '',
  primary_tech: '',
  tech_stack: [],
  commits_count: '',
  team_size: '1',
  duration: '',
  features: [],
  challenges_solved: [],
  gradient_from: '',
  gradient_to: '',
  thumbnail_url: '',
  sort_order: 0,
};

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading projects:', error);
        setMessage('Error loading projects');
        return;
      }

      // Normalize the data to ensure all fields have proper types
      const normalizedProjects = (data || []).map(project => ({
        ...project,
        title: project.title || '',
        description: project.description || '',
        long_description: project.long_description || '',
        category: project.category || 'web',
        status: project.status || 'Completed',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        project_url: project.project_url || '',
        github_url: project.github_url || '',
        demo_url: project.demo_url || '',
        primary_tech: project.primary_tech || '',
        commits_count: project.commits_count || '',
        team_size: project.team_size || '1',
        duration: project.duration || '',
        gradient_from: project.gradient_from || '',
        gradient_to: project.gradient_to || '',
        thumbnail_url: project.thumbnail_url || '',
        tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
        features: Array.isArray(project.features) ? project.features : [],
        challenges_solved: Array.isArray(project.challenges_solved) ? project.challenges_solved : [],
        year: project.year || new Date().getFullYear(),
        sort_order: project.sort_order || 0,
        featured: Boolean(project.featured),
      }));

      setProjects(normalizedProjects);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: ProjectData) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        setMessage('Error deleting project');
        return;
      }

      setMessage('Project deleted successfully!');
      await loadProjects();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error deleting project');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (projectData: ProjectData) => {
    setSaving(true);
    setMessage('');

    try {
      if (editingProject?.id) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update({
            ...projectData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProject.id);

        if (error) {
          console.error('Error updating project:', error);
          setMessage('Error updating project');
          return;
        }

        setMessage('Project updated successfully!');
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) {
          console.error('Error creating project:', error);
          setMessage('Error creating project');
          return;
        }

        setMessage('Project created successfully!');
      }

      setShowForm(false);
      setEditingProject(null);
      await loadProjects();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <ProjectForm
        project={editingProject}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingProject(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-400">Projects Management</h2>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowForm(true);
          }}
          className="px-6 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/30"
        >
          Add New Project
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${message.includes('Error')
          ? 'bg-red-500/20 text-red-400 border-red-400/30'
          : 'bg-green-500/20 text-green-400 border-green-400/30'
          }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-gray-800/50 border border-gray-600/50 rounded-lg overflow-hidden">
            {project.thumbnail_url && (
              <Image
                src={project.thumbnail_url}
                alt={project.title}
                width={400}
                height={192}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className={getCategoryInfo(project.category).bgClass + ' px-2 py-1 rounded text-xs'}>
                      {getCategoryInfo(project.category).label}
                    </span>
                    <span className={getStatusInfo(project.status).bgClass + ' px-2 py-1 rounded text-xs'}>
                      {project.status}
                    </span>
                    {project.featured && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(project)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id!)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
                    disabled={saving}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-400 font-medium mb-1">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tech_stack?.slice(0, 3).map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                    {(project.tech_stack?.length || 0) > 3 && (
                      <span className="text-gray-500 text-xs">+{(project.tech_stack?.length || 0) - 3}</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-green-400 font-medium mb-1">Details</p>
                  <p className="text-gray-400">Year: {project.year}</p>
                  {project.duration && <p className="text-gray-400">Duration: {project.duration}</p>}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-700">
                {project.project_url && (
                  <a href={project.project_url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs">Live Demo</a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-xs">GitHub</a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No projects found. Add your first project!</p>
        </div>
      )}
    </div>
  );
}

interface ProjectFormProps {
  project: ProjectData | null;
  onSave: (project: ProjectData) => void;
  onCancel: () => void;
  saving: boolean;
}

function ProjectForm({ project, onSave, onCancel, saving }: ProjectFormProps) {
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Load project images when editing an existing project
  useEffect(() => {
    if (project?.id) {
      setLoadingImages(true);
      getProjectImages(project.id)
        .then(setProjectImages)
        .catch(console.error)
        .finally(() => setLoadingImages(false));
    } else {
      setProjectImages([]);
    }
  }, [project?.id]);

  // Normalize the project data to ensure all string fields are strings, not null
  const normalizeProjectData = (data: ProjectData | null): ProjectData => {
    if (!data) return initialProjectData;

    return {
      ...initialProjectData,
      ...data,
      // Ensure all string fields are strings, not null
      title: data.title || '',
      description: data.description || '',
      long_description: data.long_description || '',
      category: data.category || 'web',
      status: data.status || 'Completed',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      project_url: data.project_url || '',
      github_url: data.github_url || '',
      demo_url: data.demo_url || '',
      primary_tech: data.primary_tech || '',
      commits_count: data.commits_count || '',
      team_size: data.team_size || '1',
      duration: data.duration || '',
      gradient_from: data.gradient_from || '',
      gradient_to: data.gradient_to || '',
      thumbnail_url: data.thumbnail_url || '',
      // Ensure arrays are arrays
      tech_stack: Array.isArray(data.tech_stack) ? data.tech_stack : [],
      features: Array.isArray(data.features) ? data.features : [],
      challenges_solved: Array.isArray(data.challenges_solved) ? data.challenges_solved : [],
      // Ensure numbers are numbers
      year: data.year || new Date().getFullYear(),
      sort_order: data.sort_order || 0,
      // Ensure boolean is boolean
      featured: Boolean(data.featured),
    };
  };

  const [formData, setFormData] = useState<ProjectData>(normalizeProjectData(project));

  const handleInputChange = (field: keyof ProjectData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'tech_stack' | 'features' | 'challenges_solved', value: string) => {
    const array = value ? value.split('\n').map(item => item.trim()).filter(item => item) : [];
    handleInputChange(field, array);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-400">
          {project?.id ? 'Edit Project' : 'Add New Project'}
        </h2>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors border border-gray-400/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-400/30 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Basic Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Project Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Short Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Long Description</label>
              <textarea
                rows={5}
                value={formData.long_description}
                onChange={(e) => handleInputChange('long_description', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Year</label>
                <input
                  type="number"
                  min="2000"
                  max="2030"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Team Size</label>
                <input
                  type="text"
                  value={formData.team_size}
                  onChange={(e) => handleInputChange('team_size', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="3 months"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="rounded border-gray-600 text-green-400 focus:ring-green-400"
              />
              <span className="text-green-400">Featured project</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Technical Details & Links */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Technical Details & Links
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Primary Technology</label>
              <input
                type="text"
                value={formData.primary_tech}
                onChange={(e) => handleInputChange('primary_tech', e.target.value)}
                placeholder="React, Python, etc."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Tech Stack <span className="text-gray-400">(one per line)</span>
              </label>
              <textarea
                rows={4}
                value={formData.tech_stack?.join('\n')}
                onChange={(e) => handleArrayChange('tech_stack', e.target.value)}
                placeholder={`React\nNode.js\nMongoDB\nTailwind CSS`}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Project URL</label>
              <input
                type="url"
                value={formData.project_url}
                onChange={(e) => handleInputChange('project_url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">GitHub URL</label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Demo URL</label>
              <input
                type="url"
                value={formData.demo_url}
                onChange={(e) => handleInputChange('demo_url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Thumbnail URL</label>
              <input
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Commits Count</label>
              <input
                type="text"
                value={formData.commits_count}
                onChange={(e) => handleInputChange('commits_count', e.target.value)}
                placeholder="150+"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Gradient From</label>
                <input
                  type="text"
                  value={formData.gradient_from}
                  onChange={(e) => handleInputChange('gradient_from', e.target.value)}
                  placeholder="#3B82F6"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Gradient To</label>
                <input
                  type="text"
                  value={formData.gradient_to}
                  onChange={(e) => handleInputChange('gradient_to', e.target.value)}
                  placeholder="#8B5CF6"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features & Challenges */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
          Features & Challenges
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">
              Key Features <span className="text-gray-400">(one per line)</span>
            </label>
            <textarea
              rows={6}
              value={formData.features?.join('\n')}
              onChange={(e) => handleArrayChange('features', e.target.value)}
              placeholder={`User authentication\nReal-time messaging\nResponsive design\nDark mode support`}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">
              Challenges Solved <span className="text-gray-400">(one per line)</span>
            </label>
            <textarea
              rows={6}
              value={formData.challenges_solved?.join('\n')}
              onChange={(e) => handleArrayChange('challenges_solved', e.target.value)}
              placeholder={`Performance optimization\nCross-browser compatibility\nState management complexity\nAPI rate limiting`}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Project Images */}
      {project?.id && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Project Images
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div>
              <ProjectImageUpload
                projectId={project.id}
                onImagesUpdate={() => {
                  // Refresh images after upload
                  getProjectImages(project.id!)
                    .then(setProjectImages)
                    .catch(console.error);
                }}
              />
            </div>

            {/* Current Images */}
            <div>
              <h4 className="text-md font-medium text-green-400 mb-4">
                Current Images ({projectImages.length})
              </h4>

              {loadingImages ? (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
                  <p className="text-gray-400">Loading images...</p>
                </div>
              ) : projectImages.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {projectImages.map((image) => (
                    <div
                      key={image.id}
                      className="bg-gray-800 border border-gray-600 rounded-lg p-3 flex items-center gap-3"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {image.alt}
                        </p>
                        {image.caption && (
                          <p className="text-gray-400 text-xs truncate">
                            {image.caption}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm('Delete this image?')) {
                            const { deleteProjectImage } = await import('../../lib/imageUpload');
                            const result = await deleteProjectImage(image.id);
                            if (result.success) {
                              setProjectImages(prev => prev.filter(img => img.id !== image.id));
                            }
                          }
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-2">📷</div>
                  <p className="text-gray-400">No images uploaded yet</p>
                  <p className="text-gray-500 text-sm">Add images using the upload form</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!project?.id && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Project Images
          </h3>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-2">💾</div>
            <p className="text-gray-400">Save the project first to add images</p>
            <p className="text-gray-500 text-sm">Images can be uploaded after creating the project</p>
          </div>
        </div>
      )}
    </form>
  );
} 