'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import {
  createProject,
  upsertProject,
  deleteProject,
  reorderProjects,
  PORTFOLIO_TAG,
} from '@lib/data';
import type { NullableWritable, Project } from '@lib/supabase';
import { requireAdminClient } from './auth';

export async function createProjectAction(
  row: NullableWritable<Project> & { id?: string }
) {
  const db = await requireAdminClient();
  const result = await createProject(db, row);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/projects');
  return result;
}

export async function upsertProjectAction(
  row: NullableWritable<Project> & { id?: string }
) {
  const db = await requireAdminClient();
  const result = await upsertProject(db, row);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/projects');
  return result;
}

export async function reorderProjectsAction(ids: string[]) {
  const db = await requireAdminClient();
  await reorderProjects(db, ids);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/projects');
}

export async function deleteProjectAction(id: string) {
  const db = await requireAdminClient();
  await deleteProject(db, id);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/projects');
}
