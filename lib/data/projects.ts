import type {
  NullableWritable,
  Project,
  ProjectImage,
  Upload,
} from '@lib/supabase'
import type { ProjectProps } from 'types/portfolio'
import type { DB } from './types'

export async function getProjects(db: DB): Promise<Project[]> {
  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function getProjectImages(
  db: DB,
  projectIds: string[],
): Promise<Map<string, ProjectImage[]>> {
  if (projectIds.length === 0) return new Map()

  const { data, error } = await db
    .from('uploads')
    .select('id, file_url, alt_text, caption, entity_id, sort_order')
    .eq('entity_type', 'project')
    .eq('field_name', 'project_collection')
    .in('entity_id', projectIds)
    .order('sort_order', { ascending: true })
  if (error) throw error

  const byProject = new Map<string, ProjectImage[]>()
  for (const row of (data ?? []) as Upload[]) {
    const list = byProject.get(row.entity_id) ?? []
    list.push({
      id: row.id,
      url: row.file_url,
      alt: row.alt_text ?? 'Project image',
      caption: row.caption,
    })
    byProject.set(row.entity_id, list)
  }
  return byProject
}

/**
 * Returns projects in the shape the existing UI (`ProjectProps`) expects,
 * with images already attached. Single batched query for images — no N+1.
 */
export async function getProjectsWithImages(db: DB): Promise<ProjectProps[]> {
  const projects = await getProjects(db)
  const imagesByProject = await getProjectImages(
    db,
    projects.map((p) => p.id),
  )
  return projects.map((p) => toProjectProps(p, imagesByProject.get(p.id) ?? []))
}

export function toProjectProps(
  project: Project,
  images: ProjectImage[],
): ProjectProps {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    longDescription: project.long_description,
    tech: project.primary_tech || 'Web',
    year: String(project.year ?? ''),
    status: project.status,
    gradient: `from-${project.gradient_from || 'blue-400'} to-${project.gradient_to || 'blue-600'}`,
    commits: project.commits_count || '0',
    languages: project.tech_stack ?? [],
    category: project.category,
    featured: project.featured,
    projectUrl: project.project_url,
    githubUrl: project.github_url,
    features: project.features,
    teamSize: project.team_size,
    duration: project.duration,
    images,
    thumbnail_url: project.thumbnail_url,
  }
}

export async function upsertProject(
  db: DB,
  row: NullableWritable<Project> & { id?: string },
): Promise<Project> {
  const { data, error } = await db
    .from('projects')
    .upsert({ ...row, updated_at: new Date().toISOString() })
    .select('*')
    .single()
  if (error) throw error
  return data as Project
}

export async function deleteProject(db: DB, id: string): Promise<void> {
  const { error } = await db.from('projects').delete().eq('id', id)
  if (error) throw error
}
