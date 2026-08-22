'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { upsertEducation, deleteEducation, PORTFOLIO_TAG } from '@lib/data';
import type { Education, NullableWritable } from '@lib/supabase';
import { requireAdminClient } from './auth';

export async function upsertEducationAction(
  row: NullableWritable<Education> & { id?: string }
) {
  const db = await requireAdminClient();
  const result = await upsertEducation(db, row);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/education');
  return result;
}

export async function deleteEducationAction(id: string) {
  const db = await requireAdminClient();
  await deleteEducation(db, id);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/education');
}
