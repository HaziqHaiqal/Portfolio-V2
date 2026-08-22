'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { updateProfile, upsertProfile, PORTFOLIO_TAG } from '@lib/data';
import type { NullableWritable, Profile } from '@lib/supabase';
import { requireAdminClient } from './auth';

export async function updateProfileAction(
  id: string,
  patch: NullableWritable<Profile>
) {
  const db = await requireAdminClient();
  const result = await updateProfile(db, id, patch);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/profile');
  return result;
}

export async function upsertProfileAction(row: NullableWritable<Profile>) {
  const db = await requireAdminClient();
  const result = await upsertProfile(db, row);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/profile');
  return result;
}
