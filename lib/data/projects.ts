import type {
  NullableWritable,
  Project,
  ProjectImage,
  Upload,
} from '@lib/supabase';
import type { ProjectProps } from 'types/portfolio';
import type { DB } from './types';

/** Public read: only projects marked visible. Admin queries its own list. */
export async function getProjects(db: DB): Promise<Project[]> {
  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getProjectImages(
  db: DB,
  projectIds: string[]
): Promise<Map<string, ProjectImage[]>> {
  if (projectIds.length === 0) return new Map();

  const { data, error } = await db
    .from('uploads')
    .select('id, file_url, alt_text, caption, entity_id, sort_order')
    .eq('entity_type', 'project')
    .eq('field_name', 'project_collection')
    .in('entity_id', projectIds)
    .order('sort_order', { ascending: true });
  if (error) throw error;

  const byProject = new Map<string, ProjectImage[]>();
  for (const row of (data ?? []) as Upload[]) {
    const list = byProject.get(row.entity_id) ?? [];
    list.push({
      id: row.id,
      url: row.file_url,
      alt: row.alt_text ?? 'Project image',
      caption: row.caption,
    });
    byProject.set(row.entity_id, list);
  }
  return byProject;
}

/**
 * Returns projects in the shape the existing UI (`ProjectProps`) expects,
 * with images already attached. Single batched query for images — no N+1.
 */
export async function getProjectsWithImages(db: DB): Promise<ProjectProps[]> {
  const projects = await getProjects(db);
  const imagesByProject = await getProjectImages(
    db,
    projects.map((p) => p.id)
  );
  return projects.map((p) =>
    toProjectProps(p, imagesByProject.get(p.id) ?? [])
  );
}

export function toProjectProps(
  project: Project,
  images: ProjectImage[]
): ProjectProps {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    longDescription: project.long_description,
    tech: project.primary_tech || 'Web',
    year: String(project.year ?? ''),
    gradient: `from-${project.gradient_from || 'blue-400'} to-${project.gradient_to || 'blue-600'}`,
    commits: project.commits_count || '0',
    languages: project.tech_stack ?? [],
    category: project.category,
    projectUrl: project.project_url,
    demoUrl: project.demo_url,
    githubUrl: project.github_url,
    features: project.features,
    teamSize: project.team_size,
    duration: project.duration,
    images,
    thumbnail_url: project.thumbnail_url,
  };
}

export async function createProject(
  db: DB,
  row: NullableWritable<Project> & { id?: string }
): Promise<Project> {
  // New projects join the end of the list; admin drag-and-drop moves them.
  const { data: last, error: lastError } = await db
    .from('projects')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) throw lastError;

  const payload = {
    ...row,
    sort_order: (last?.sort_order ?? -1) + 1,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await db
    .from('projects')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data as Project;
}

/** Persists a full ordering: `ids[0]` gets sort_order 0, and so on. */
export async function reorderProjects(db: DB, ids: string[]): Promise<void> {
  const { error } = await db.rpc('reorder_projects', { ids });
  if (error) throw error;
}

export async function upsertProject(
  db: DB,
  row: NullableWritable<Project> & { id?: string }
): Promise<Project> {
  const { id, ...patch } = row;
  const payload = { ...patch, updated_at: new Date().toISOString() };

  // A patch with `id` targets an existing row: a genuine UPDATE, so only
  // the given columns are validated. Routing this through `.upsert()`
  // instead makes Postgres construct a full candidate row for the insert
  // path it never takes, which trips NOT NULL on every omitted column.
  const { data, error } = id
    ? await db
        .from('projects')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()
    : await db.from('projects').insert(payload).select('*').single();

  if (error) throw error;
  return data as Project;
}

export async function deleteProject(db: DB, id: string): Promise<void> {
  const { error } = await db.from('projects').delete().eq('id', id);
  if (error) throw error;
}
