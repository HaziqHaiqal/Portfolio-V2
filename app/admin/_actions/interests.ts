'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { upsertInterest, deleteInterest, PORTFOLIO_TAG } from '@lib/data';
import type { Interest, NullableWritable } from '@lib/supabase';
import { requireAdminClient } from './auth';

export async function upsertInterestAction(
  row: NullableWritable<Interest> & { id?: string }
) {
  const db = await requireAdminClient();
  const result = await upsertInterest(db, row);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/interests');
  return result;
}

export async function deleteInterestAction(id: string) {
  const db = await requireAdminClient();
  await deleteInterest(db, id);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/interests');
}
