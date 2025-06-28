'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import {
  Plus,
  Edit,
  Trash2,
  X,
  FolderOpen,
  Loader2,
  Check,
  AlertCircle,
  Star,
  StarOff,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Badge } from '@components/ui/badge';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';
import UniversalUpload from './UniversalUpload';
import { getFiles, deleteFileById, type UploadedFile } from '@lib/fileManager';

interface ProjectData {
  id?: string;
  title: string;
  description: string;
  long_description: string;
  tech_stack: string[];
  features: string[];
  challenges_solved: string[];
  project_url: string;
  github_url: string;
  demo_url: string;
  thumbnail_url: string;
  start_date: string;
  end_date: string;
  year: number;
  status: string;
  category: string;
  primary_tech: string;
  team_size: string;
  duration: string;
  commits_count: string;
  featured: boolean;
  sort_order: number;
  gradient_from: string;
  gradient_to: string;
}

const initialProjectData: ProjectData = {
  title: '',
  description: '',
  long_description: '',
  tech_stack: [],
  features: [],
  challenges_solved: [],
  project_url: '',
  github_url: '',
  demo_url: '',
  thumbnail_url: '',
  start_date: '',
  end_date: '',
  year: new Date().getFullYear(),
  status: 'Completed',
  category: 'Web Development',
  primary_tech: '',
  team_size: '1',
  duration: '',
  commits_count: '',
  featured: false,
  sort_order: 0,
  gradient_from: '#3B82F6',
  gradient_to: '#8B5CF6',
};

// Helper function to normalize project data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeProjectData = (project: any): ProjectData => {
  return {
    ...initialProjectData,
    ...project,
    // Ensure all string fields are never null
    title: project?.title || '',
    description: project?.description || '',
    long_description: project?.long_description || '',
    project_url: project?.project_url || '',
    github_url: project?.github_url || '',
    demo_url: project?.demo_url || '',
    thumbnail_url: project?.thumbnail_url || '',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    status: project?.status || 'Completed',
    category: project?.category || 'Web Development',
    primary_tech: project?.primary_tech || '',
    team_size: project?.team_size || '1',
    duration: project?.duration || '',
    commits_count: project?.commits_count || '',
    gradient_from: project?.gradient_from || '#3B82F6',
    gradient_to: project?.gradient_to || '#8B5CF6',
    // Ensure arrays are always arrays
    tech_stack: Array.isArray(project?.tech_stack) ? project.tech_stack : [],
    features: Array.isArray(project?.features) ? project.features : [],
    challenges_solved: Array.isArray(project?.challenges_solved) ? project.challenges_solved : [],
    // Ensure numbers and booleans have proper defaults
    year: project?.year || new Date().getFullYear(),
    sort_order: project?.sort_order || 0,
    featured: Boolean(project?.featured),
  };
};

const projectCategories = [
  'Web Development',
  'Mobile App',
  'Desktop App',
  'API/Backend',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Design',
  'Other'
];

const statusOptions = [
  'Completed',
  'In Progress',
  'Planned',
  'On Hold',
  'Archived'
];

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [filter, setFilter] = useState<string>('');
  const supabase = createClient();

  const loadProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading projects:', error);
        setMessage({ type: 'error', text: 'Error loading projects' });
        return;
      }

      // Normalize all project data to ensure no null values
      const normalizedProjects = (data || []).map(project => normalizeProjectData(project));
      setProjects(normalizedProjects);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error loading projects' });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleEdit = (project: ProjectData) => {
    setEditingProject(normalizeProjectData(project));
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
        setMessage({ type: 'error', text: 'Error deleting project' });
        return;
      }

      setMessage({ type: 'success', text: 'Project deleted successfully!' });
      await loadProjects();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error deleting project' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (projectData: ProjectData) => {
    setSaving(true);
    setMessage(null);

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
          setMessage({ type: 'error', text: 'Error updating project' });
          return;
        }

        setMessage({ type: 'success', text: 'Project updated successfully!' });
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) {
          console.error('Error creating project:', error);
          setMessage({ type: 'error', text: 'Error creating project' });
          return;
        }

        setMessage({ type: 'success', text: 'Project created successfully!' });
      }

      setShowForm(false);
      setEditingProject(null);
      await loadProjects();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error saving project' });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (project: ProjectData) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ featured: !project.featured })
        .eq('id', project.id);

      if (error) {
        console.error('Error toggling featured:', error);
        return;
      }

      await loadProjects();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(filter.toLowerCase()) ||
    project.category.toLowerCase().includes(filter.toLowerCase()) ||
    project.tech_stack.some(tech => tech.toLowerCase().includes(filter.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FolderOpen className="w-4 h-4" />
            Loading projects data...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ProjectForm
        project={editingProject ? normalizeProjectData(editingProject) : initialProjectData}
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
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.div
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-xl mb-2 shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <FolderOpen size={24} />
            projects.manage()
          </motion.div>
          <p className="text-gray-400 font-mono">
            <span className="text-blue-500">{'// '}</span>
            Manage your portfolio projects and showcase your work.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => {
              setEditingProject(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Project
          </Button>
        </motion.div>
      </motion.div>

      {/* Success/Error Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`p-4 rounded-lg border ${message.type === 'success'
                ? 'bg-green-900/50 border-green-700 text-green-300'
                : 'bg-red-900/50 border-red-700 text-red-300'
              }`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white"
          />
        </div>
        <div className="w-full sm:w-48">
          <Badge className="bg-gray-700 text-gray-300 border-gray-600 h-10 flex items-center justify-center">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
          </Badge>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gray-800 border-gray-700 hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25">
              {/* Featured Badge */}
              {project.featured && (
                <motion.div
                  className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-1 rounded-full shadow-lg"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Star className="w-3 h-3" />
                </motion.div>
              )}

              {/* Gradient Background */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  background: `linear-gradient(135deg, ${project.gradient_from || '#3b82f6'}, ${project.gradient_to || '#8b5cf6'})`
                }}
              />

              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📁</span>
                    <div>
                      <CardTitle className="text-lg font-bold text-white">
                        {project.title}
                      </CardTitle>
                      <Badge
                        className="mt-1 bg-gray-700 text-gray-300 border-gray-600"
                      >
                        {project.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                <p className="text-sm text-gray-300 line-clamp-3">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1">
                  {project.tech_stack?.slice(0, 3).map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
                      variant="secondary"
                      className="text-xs bg-gray-700 text-gray-300"
                    >
                      {tech}
                    </Badge>
                  ))}
                  {project.tech_stack?.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                      +{project.tech_stack.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className="font-medium text-white">
                    {project.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeatured(project)}
                    disabled={saving}
                    className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                  >
                    {project.featured ? (
                      <StarOff className="w-3 h-3 mr-1" />
                    ) : (
                      <Star className="w-3 h-3 mr-1" />
                    )}
                    {project.featured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(project)}
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(project.id!)}
                    disabled={saving}
                    className="bg-red-900/50 border-red-700 hover:bg-red-900 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700"
          >
            <FolderOpen className="w-12 h-12 text-blue-500" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-400 mb-6">
            {filter ? 'Try adjusting your search filters.' : 'Get started by adding your first project.'}
          </p>
          {!filter && (
            <Button
              onClick={() => {
                setEditingProject(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Project
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ============= PROJECT FORM COMPONENT =============

interface ProjectFormProps {
  project: ProjectData;
  onSave: (project: ProjectData) => void;
  onCancel: () => void;
  saving: boolean;
}

function ProjectForm({ project, onSave, onCancel, saving }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectData>(normalizeProjectData(project));
  const [newTech, setNewTech] = useState('');
  const [projectImages, setProjectImages] = useState<UploadedFile[]>([]);

  // Load existing images when editing an existing project
  useEffect(() => {
    const fetchImages = async () => {
      if (formData.id) {
        try {
          const images = await getFiles('project', formData.id, 'project_collection');
          setProjectImages(images);
        } catch (err) {
          console.error('Error loading project images:', err);
        }
      }
    };

    fetchImages();
  }, [formData.id]);

  const handleInputChange = (field: keyof ProjectData, value: string | number | boolean | string[]) => {
    // Ensure string values are never null or undefined
    const normalizedValue = typeof value === 'string' ? (value || '') : value;
    setFormData(prev => ({ ...prev, [field]: normalizedValue }));
  };

  const handleAddToArray = (field: 'tech_stack' | 'features' | 'challenges_solved', value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const handleRemoveFromArray = (field: 'tech_stack' | 'features' | 'challenges_solved', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <FolderOpen className="h-6 w-6 text-white" />
                </motion.div>
                <span className="text-white">
                  {project.id ? 'Edit Project' : 'Add New Project'}
                </span>
              </CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                {project.id ? 'Update project information and details' : 'Add a new project to your portfolio'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={onCancel}
              className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Project Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., E-commerce Platform, Mobile App"
                  required
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  className="w-full bg-gray-700 border border-gray-600 focus:border-blue-500 text-white rounded-md px-3 py-2"
                >
                  {projectCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-white">
                Short Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description for project cards..."
                required
                rows={3}
                className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
              />
            </div>

            {/* Project Thumbnail */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-white">
                Project Thumbnail
              </Label>
              <UniversalUpload
                uploadType="project_thumbnail"
                entityId={formData.id || 'new-project'}
                value={formData.thumbnail_url}
                onChange={(url) => handleInputChange('thumbnail_url', url)}
                label="Thumbnail Image"
                description="Upload a thumbnail image for this project (recommended: 16:9 aspect ratio)"
                enableCrop={true}
                cropAspect={16 / 9}
                allowUrlInput={true}
                placeholder="https://example.com/project-thumbnail.jpg"
              />
            </div>

            {/* Project Images Gallery */}
            {formData.id && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-white">
                  Project Images Gallery
                </Label>
                <UniversalUpload
                  uploadType="project_image"
                  entityId={formData.id}
                  onCollectionUpdate={(files) => setProjectImages(files)}
                  label="Additional Images"
                  description="Upload additional screenshots, mockups, or images for this project"
                  enableCrop={true}
                  cropAspect={16 / 9}
                  allowUrlInput={true}
                />

                {/* Display existing project images */}
                {projectImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {projectImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <Image
                          src={img.url}
                          alt={img.alt || 'Project image'}
                          width={0}
                          height={0}
                          sizes="100vw"
                          className="w-full h-auto rounded-lg object-contain bg-gray-900"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm('Delete this image?')) return;
                            const res = await deleteFileById(img.id);
                            if (res.success) {
                              setProjectImages((prev) => prev.filter((p) => p.id !== img.id));
                            } else {
                              alert(`Failed to delete image: ${res.error}`);
                            }
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tech Stack */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Tech Stack
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="e.g., React, Node.js, PostgreSQL"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('tech_stack', newTech, setNewTech))}
                    className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddToArray('tech_stack', newTech, setNewTech)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tech_stack.map((tech, index) => (
                    <Badge
                      key={index}
                      className="bg-gray-700 text-gray-300 border-gray-600 cursor-pointer hover:bg-gray-600"
                      onClick={() => handleRemoveFromArray('tech_stack', index)}
                    >
                      {tech} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Status
                </Label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 focus:border-blue-500 text-white rounded-md px-3 py-2"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Links */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Project URL
                </Label>
                <Input
                  type="url"
                  value={formData.project_url}
                  onChange={(e) => handleInputChange('project_url', e.target.value)}
                  placeholder="https://your-project.com"
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  GitHub URL
                </Label>
                <Input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => handleInputChange('github_url', e.target.value)}
                  placeholder="https://github.com/user/repo"
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Settings
              </Label>

              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <Checkbox
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', !!checked)}
                />
                <div>
                  <span className="text-sm font-medium text-white">
                    Featured Project
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Display this project prominently on your portfolio
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-blue-200/50 dark:border-blue-800/50">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.title || !formData.category || !formData.description}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg min-w-[120px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {project.id ? 'Update Project' : 'Create Project'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
} 