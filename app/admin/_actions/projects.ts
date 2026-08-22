'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { upsertProject, deleteProject, PORTFOLIO_TAG } from '@lib/data';
import type { NullableWritable, Project } from '@lib/supabase';
import { requireAdminClient } from './auth';

export async function upsertProjectAction(
  row: NullableWritable<Project> & { id?: string }
) {
  const db = await requireAdminClient();
  const result = await upsertProject(db, row);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/projects');
  return result;
}

export async function deleteProjectAction(id: string) {
  const db = await requireAdminClient();
  await deleteProject(db, id);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/projects');
}
