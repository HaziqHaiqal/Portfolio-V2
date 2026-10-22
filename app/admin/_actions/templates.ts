'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { upsertTemplate, deleteTemplate, TEMPLATES_TAG } from '@lib/data';
import type { NullableWritable, WebsiteTemplate } from '@lib/supabase';
import { requireAdminClient } from './auth';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function upsertTemplateAction(
  row: NullableWritable<WebsiteTemplate> & { id?: string },
  mode: 'create' | 'update' = 'update'
) {
  const db = await requireAdminClient();
  if (row.slug !== undefined && !SLUG_PATTERN.test(row.slug ?? '')) {
    throw new Error(
      'The slug can only use lowercase letters, numbers and single dashes.'
    );
  }
  const result = await upsertTemplate(db, row, mode);
  revalidateTag(TEMPLATES_TAG, 'max');
  revalidatePath('/admin/templates');
  return result;
}

export async function deleteTemplateAction(id: string) {
  const db = await requireAdminClient();
  await deleteTemplate(db, id);
  revalidateTag(TEMPLATES_TAG, 'max');
  revalidatePath('/admin/templates');
}
