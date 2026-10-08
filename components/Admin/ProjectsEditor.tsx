'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { m } from 'framer-motion';
import { toast } from 'sonner';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UniversalImage from '@components/Media/UniversalImage';
import {
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  GripVertical,
  ImageIcon,
  Lightbulb,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { SiGithub } from 'react-icons/si';

import { createBrowserSupabase } from '@lib/supabase/browser';
import {
  createProjectAction,
  upsertProjectAction,
  deleteProjectAction,
  reorderProjectsAction,
} from '@app/admin/_actions/projects';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Textarea } from '@components/ui/textarea';
import { Switch } from '@components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/ui/select';
import UniversalUpload, {
  type UniversalUploadHandle,
} from '@components/Media/UniversalUpload';
import { getFiles, deleteFileById, type UploadedFile } from '@lib/fileManager';
import {
  BulletList,
  CardCover,
  CardGridSkeleton,
  ConfirmDialog,
  EditDeleteActions,
  EditorPanel,
  EmptyState,
  EntityCard,
  Field,
  FormActions,
  FormGrid,
  FormSection,
  IconAction,
  PageHeader,
  SearchInput,
  TagInput,
  ToggleRow,
  Toolbar,
  useConfirm,
} from '@components/Admin/shared';
import { listContainer } from '@constants/motion';
import { PROJECT_CATEGORIES, getCategoryInfo } from '@constants/projects';
import { pluralize } from '@lib/format';
import { cn } from '@lib/utils';

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
  category: string;
  primary_tech: string;
  team_size: string;
  duration: string;
  commits_count: string;
  is_visible: boolean;
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
  category: 'web',
  primary_tech: '',
  team_size: '1',
  duration: '',
  commits_count: '',
  is_visible: true,
  sort_order: 0,
  gradient_from: '#2563EB',
  gradient_to: '#7C3AED',
};

const normalizeProjectData = (
  project: Partial<ProjectData> | null | undefined
): ProjectData => ({
  ...initialProjectData,
  ...project,
  title: project?.title || '',
  description: project?.description || '',
  long_description: project?.long_description || '',
  project_url: project?.project_url || '',
  github_url: project?.github_url || '',
  demo_url: project?.demo_url || '',
  thumbnail_url: project?.thumbnail_url || '',
  start_date: project?.start_date || '',
  end_date: project?.end_date || '',
  category: project?.category || 'web',
  primary_tech: project?.primary_tech || '',
  team_size: project?.team_size || '1',
  duration: project?.duration || '',
  commits_count: project?.commits_count || '',
  gradient_from: project?.gradient_from || initialProjectData.gradient_from,
  gradient_to: project?.gradient_to || initialProjectData.gradient_to,
  tech_stack: Array.isArray(project?.tech_stack) ? project.tech_stack : [],
  features: Array.isArray(project?.features) ? project.features : [],
  challenges_solved: Array.isArray(project?.challenges_solved)
    ? project.challenges_solved
    : [],
  year: project?.year || new Date().getFullYear(),
  sort_order: project?.sort_order || 0,
  is_visible: project?.is_visible !== false,
});

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const supabase = createBrowserSupabase();
  const confirmDelete = useConfirm<ProjectData>();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading projects:', error);
        toast.error('Could not load projects');
        return;
      }

      setProjects((data || []).map(normalizeProjectData));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not load projects');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async (project: ProjectData) => {
    try {
      await deleteProjectAction(project.id!);
      toast.success(`Deleted "${project.title}"`);
      await loadProjects();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not delete project');
    }
  };

  const handleSave = async (projectData: ProjectData) => {
    setSaving(true);
    try {
      const row = {
        ...projectData,
        start_date: projectData.start_date || null,
        end_date: projectData.end_date || null,
      };
      if (editingProject?.id) {
        await upsertProjectAction({ ...row, id: editingProject.id });
      } else {
        await createProjectAction(row);
      }
      toast.success(editingProject?.id ? 'Project updated' : 'Project created');
      setShowForm(false);
      setEditingProject(null);
      await loadProjects();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not save project');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (project: ProjectData) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, is_visible: !p.is_visible } : p
      )
    );
    try {
      await upsertProjectAction({
        id: project.id,
        is_visible: !project.is_visible,
      });
      await loadProjects();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not update project');
      await loadProjects();
    }
  };

  const handleReorder = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = projects.findIndex((p) => p.id === active.id);
    const to = projects.findIndex((p) => p.id === over.id);
    // Keep sort_order in step so a later form save can't write a stale position.
    const next = arrayMove(projects, from, to).map((p, i) => ({
      ...p,
      sort_order: i,
    }));
    setProjects(next);
    try {
      await reorderProjectsAction(next.map((p) => p.id!));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not save the new order');
      await loadProjects();
    }
  };

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        getCategoryInfo(project.category).label.toLowerCase().includes(q) ||
        project.tech_stack.some((tech) => tech.toLowerCase().includes(q));
      const matchesCategory =
        categoryFilter === 'all' || project.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [projects, query, categoryFilter]);

  const isFiltered = query.trim() !== '' || categoryFilter !== 'all';

  const clearFilters = () => {
    setQuery('');
    setCategoryFilter('all');
  };

  const startCreate = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <ProjectForm
        project={editingProject || initialProjectData}
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
      <PageHeader
        eyebrow="Content"
        title="Projects"
        description="The work you've built, shown on your portfolio."
        actions={
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      <Toolbar
        meta={
          loading
            ? undefined
            : `${pluralize(filteredProjects.length, 'project')}${
                isFiltered
                  ? ` of ${projects.length} · clear filters to reorder`
                  : ''
              }`
        }
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by title, category or tech..."
          className="sm:max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 bg-card sm:w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {PROJECT_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Toolbar>

      {loading ? (
        <CardGridSkeleton />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={isFiltered ? 'No matching projects' : 'No projects yet'}
          description={
            isFiltered
              ? 'Try a different search term or category.'
              : 'Add your first project to start filling out the portfolio.'
          }
          action={
            isFiltered ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button size="sm" onClick={startCreate}>
                <Plus className="h-4 w-4" />
                New project
              </Button>
            )
          }
        />
      ) : (
        <DndContext
          id="projects-order"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleReorder}
        >
          <SortableContext
            items={filteredProjects.map((p) => p.id!)}
            strategy={rectSortingStrategy}
          >
            <m.div
              variants={listContainer}
              initial="hidden"
              animate="show"
              className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredProjects.map((project) => (
                <SortableCard
                  key={project.id}
                  id={project.id!}
                  disabled={isFiltered}
                >
                  {(dragHandle) => (
                    <EntityCard
                      cover={
                        <CardCover>
                          {project.thumbnail_url ? (
                            <UniversalImage
                              src={project.thumbnail_url}
                              alt={project.title}
                              width={0}
                              height={0}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className="absolute inset-0 flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${project.gradient_from}33, ${project.gradient_to}33)`,
                              }}
                            >
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          {!project.is_visible && (
                            <Badge
                              variant="outline"
                              className="absolute left-3 top-3 z-10 gap-1 border-border bg-background/80 font-normal text-muted-foreground backdrop-blur"
                            >
                              <EyeOff className="h-3 w-3" />
                              Hidden
                            </Badge>
                          )}
                        </CardCover>
                      }
                      title={project.title}
                      subtitle={[
                        getCategoryInfo(project.category).label,
                        project.year || null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      actions={
                        <>
                          {dragHandle}
                          {project.github_url && (
                            <IconAction
                              label="Open repository"
                              onClick={() =>
                                window.open(
                                  project.github_url,
                                  '_blank',
                                  'noopener,noreferrer'
                                )
                              }
                            >
                              <SiGithub className="h-3.5 w-3.5" />
                            </IconAction>
                          )}
                          {project.project_url && (
                            <IconAction
                              label="Open project"
                              onClick={() =>
                                window.open(
                                  project.project_url,
                                  '_blank',
                                  'noopener,noreferrer'
                                )
                              }
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </IconAction>
                          )}
                          <EditDeleteActions
                            onEdit={() => {
                              setEditingProject(normalizeProjectData(project));
                              setShowForm(true);
                            }}
                            onDelete={() => confirmDelete.ask(project)}
                            extra={
                              <IconAction
                                label={
                                  project.is_visible
                                    ? 'Hide from portfolio'
                                    : 'Show on portfolio'
                                }
                                onClick={() => toggleVisible(project)}
                              >
                                {project.is_visible ? (
                                  <Eye className="h-3.5 w-3.5" />
                                ) : (
                                  <EyeOff className="h-3.5 w-3.5" />
                                )}
                              </IconAction>
                            }
                          />
                        </>
                      }
                    >
                      <div className="space-y-3">
                        {project.description && (
                          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {project.description}
                          </p>
                        )}

                        {project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {project.tech_stack.slice(0, 3).map((tech, i) => (
                              <Badge
                                key={`${tech}-${i}`}
                                variant="secondary"
                                className="px-2 py-0 text-[11px] font-normal"
                              >
                                {tech}
                              </Badge>
                            ))}
                            {project.tech_stack.length > 3 && (
                              <span className="text-[11px] tabular-nums text-muted-foreground">
                                +{project.tech_stack.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </EntityCard>
                  )}
                </SortableCard>
              ))}
            </m.div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => !open && confirmDelete.dismiss()}
        loading={confirmDelete.loading}
        title="Delete project?"
        description={
          confirmDelete.target
            ? `"${confirmDelete.target.title}" will be removed from your portfolio. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={() => confirmDelete.run(handleDelete)}
      />
    </div>
  );
}

function SortableCard({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: (dragHandle: React.ReactNode) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'h-full rounded-xl',
        isDragging && 'relative z-10 shadow-lg ring-2 ring-primary/40'
      )}
    >
      {children(
        disabled ? null : (
          <IconAction
            ref={setActivatorNodeRef}
            label="Drag to reorder"
            className="mr-auto cursor-grab touch-none active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </IconAction>
        )
      )}
    </div>
  );
}

interface ProjectFormProps {
  project: ProjectData;
  onSave: (project: ProjectData) => void | Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function ProjectForm({ project, onSave, onCancel, saving }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectData>(() => ({
    ...normalizeProjectData(project),
    id: project.id || crypto.randomUUID(),
  }));
  const [projectImages, setProjectImages] = useState<UploadedFile[]>([]);
  const [committingUpload, setCommittingUpload] = useState(false);
  const thumbnailUploadRef = useRef<UniversalUploadHandle>(null);
  const galleryUploadRef = useRef<UniversalUploadHandle>(null);
  const confirmImageDelete = useConfirm<UploadedFile>();

  useEffect(() => {
    const fetchImages = async () => {
      if (!formData.id) return;
      try {
        setProjectImages(
          await getFiles('project', formData.id, 'project_collection')
        );
      } catch (err) {
        console.error('Error loading project images:', err);
      }
    };
    fetchImages();
  }, [formData.id]);

  const set = <K extends keyof ProjectData>(field: K, value: ProjectData[K]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleDeleteImage = async (img: UploadedFile) => {
    const res = await deleteFileById(img.id);
    if (res.success) {
      setProjectImages((prev) => prev.filter((p) => p.id !== img.id));
      toast.success('Image deleted');
    } else {
      toast.error(`Could not delete image: ${res.error}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let next = formData;
    const pendingUploads = [
      {
        ref: thumbnailUploadRef,
        field: 'thumbnail_url' as const,
        label: 'Thumbnail',
      },
      { ref: galleryUploadRef, field: null, label: 'Gallery' },
    ];

    if (pendingUploads.some(({ ref }) => ref.current?.hasPending())) {
      setCommittingUpload(true);
      try {
        for (const { ref, field, label } of pendingUploads) {
          if (!ref.current?.hasPending()) continue;
          const result = await ref.current.commitPending();
          if (!result.ok) {
            toast.error(`${label} upload failed: ${result.error}`);
            return;
          }
          if (field && result.url) next = { ...next, [field]: result.url };
          if (result.files) setProjectImages(result.files);
        }
      } finally {
        setCommittingUpload(false);
      }
    }

    await onSave(next);
  };

  const busy = saving || committingUpload;
  const canSubmit =
    !!formData.title && !!formData.category && !!formData.description;

  return (
    <form onSubmit={handleSubmit}>
      <EditorPanel
        eyebrow={project.id ? 'Editing project' : 'New project'}
        title={project.id ? project.title || 'Edit project' : 'New project'}
        description="Everything here feeds the project card and detail view on your portfolio."
        onBack={onCancel}
        backLabel="Projects"
        footer={
          <FormActions>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={busy || !canSubmit}>
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {committingUpload
                ? 'Uploading...'
                : project.id
                  ? 'Save changes'
                  : 'Create project'}
            </Button>
          </FormActions>
        }
      >
        <FormSection title="Overview">
          <FormGrid>
            <Field label="Title" htmlFor="title" required>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Portfolio CMS"
                required
              />
            </Field>
            <Field label="Primary technology" htmlFor="primary_tech">
              <Input
                id="primary_tech"
                value={formData.primary_tech}
                onChange={(e) => set('primary_tech', e.target.value)}
                placeholder="Next.js"
              />
            </Field>
            <Field label="Category" htmlFor="category" required>
              <Select
                value={formData.category}
                onValueChange={(v) => set('category', v)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FormGrid>

          <Field
            label="Short description"
            htmlFor="description"
            required
            hint="Shown on the project card. One or two sentences."
          >
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What it is and who it's for."
              rows={3}
              required
              className="resize-y"
            />
          </Field>

          <Field label="Full description" htmlFor="long_description">
            <Textarea
              id="long_description"
              value={formData.long_description}
              onChange={(e) => set('long_description', e.target.value)}
              placeholder="The longer write-up: context, approach, outcome."
              className="min-h-[150px] resize-y"
            />
          </Field>
        </FormSection>

        <FormSection
          title="Thumbnail"
          description="The cover image on the project card. 16:9 works best."
        >
          <UniversalUpload
            ref={thumbnailUploadRef}
            uploadType="project_thumbnail"
            entityId={formData.id || ''}
            value={formData.thumbnail_url}
            onChange={(url) => set('thumbnail_url', url)}
            enableCrop={true}
            cropAspect={16 / 9}
            allowUrlInput={true}
            placeholder="https://example.com/thumbnail.jpg"
          />
        </FormSection>

        {formData.id && (
          <FormSection
            title="Gallery"
            description="Additional screenshots and mockups for the detail view."
          >
            <UniversalUpload
              ref={galleryUploadRef}
              uploadType="project_image"
              entityId={formData.id}
              onCollectionUpdate={(files) => setProjectImages(files)}
              enableCrop={true}
              cropAspect={16 / 9}
              allowUrlInput={true}
            />

            {projectImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {projectImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-[16/9] overflow-hidden rounded-lg border border-border bg-surface-sunken"
                  >
                    <UniversalImage
                      src={img.url}
                      alt={img.alt || 'Project image'}
                      width={0}
                      height={0}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => confirmImageDelete.ask(img)}
                      title="Delete image"
                      aria-label="Delete image"
                      className="absolute right-2 top-2 rounded-md bg-background/80 p-1.5 text-muted-foreground opacity-0 backdrop-blur transition-all hover:bg-destructive hover:text-destructive-foreground focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormSection>
        )}

        <FormSection title="Tech stack" description="Press Enter to add.">
          <TagInput
            value={formData.tech_stack}
            onChange={(next) => set('tech_stack', next)}
            placeholder="React, Supabase, Tailwind..."
          />
        </FormSection>

        <FormSection title="Features">
          <BulletList
            value={formData.features}
            onChange={(next) => set('features', next)}
            placeholder="Real-time collaborative editing..."
          />
        </FormSection>

        <FormSection
          title="Challenges solved"
          description="The hard parts, and what you did about them."
        >
          <BulletList
            value={formData.challenges_solved}
            onChange={(next) => set('challenges_solved', next)}
            placeholder="Cut cold-start time from 4s to 300ms..."
            icon={Lightbulb}
            accent="copper"
          />
        </FormSection>

        <FormSection title="Links">
          <FormGrid>
            <Field label="Live project" htmlFor="project_url">
              <Input
                id="project_url"
                type="url"
                value={formData.project_url}
                onChange={(e) => set('project_url', e.target.value)}
                placeholder="https://example.com"
              />
            </Field>
            <Field label="Repository" htmlFor="github_url">
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => set('github_url', e.target.value)}
                placeholder="https://github.com/user/repo"
              />
            </Field>
            <Field label="Demo" htmlFor="demo_url">
              <Input
                id="demo_url"
                type="url"
                value={formData.demo_url}
                onChange={(e) => set('demo_url', e.target.value)}
                placeholder="https://demo.example.com"
              />
            </Field>
          </FormGrid>
        </FormSection>

        <FormSection title="Timeline and scale">
          <FormGrid>
            <Field label="Start date" htmlFor="start_date">
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => set('start_date', e.target.value)}
              />
            </Field>
            <Field label="End date" htmlFor="end_date">
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => set('end_date', e.target.value)}
              />
            </Field>
            <Field label="Year" htmlFor="year">
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) =>
                  set(
                    'year',
                    parseInt(e.target.value) || new Date().getFullYear()
                  )
                }
              />
            </Field>
            <Field label="Team size" htmlFor="team_size">
              <Input
                id="team_size"
                value={formData.team_size}
                onChange={(e) => set('team_size', e.target.value)}
                placeholder="1"
              />
            </Field>
            <Field label="Duration" htmlFor="duration">
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => set('duration', e.target.value)}
                placeholder="3 months"
              />
            </Field>
            <Field label="Commits" htmlFor="commits_count">
              <Input
                id="commits_count"
                value={formData.commits_count}
                onChange={(e) => set('commits_count', e.target.value)}
                placeholder="240"
              />
            </Field>
          </FormGrid>
        </FormSection>

        <FormSection title="Visibility">
          <ToggleRow
            label="Show on portfolio"
            description="Turn off to keep this project in admin only."
            control={
              <Switch
                checked={formData.is_visible}
                onCheckedChange={(checked) => set('is_visible', checked)}
              />
            }
          />
        </FormSection>
      </EditorPanel>

      <ConfirmDialog
        open={confirmImageDelete.open}
        onOpenChange={(open) => !open && confirmImageDelete.dismiss()}
        loading={confirmImageDelete.loading}
        title="Delete image?"
        description="This removes the file from storage and cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmImageDelete.run(handleDeleteImage)}
      />
    </form>
  );
}
