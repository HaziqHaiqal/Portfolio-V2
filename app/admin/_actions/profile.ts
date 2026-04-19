'use server'

import { revalidatePath } from 'next/cache'
import { updateProfile, upsertProfile } from '@lib/data'
import type { NullableWritable, Profile } from '@lib/supabase'
import { requireAdminClient } from './auth'

export async function updateProfileAction(
  id: string,
  patch: NullableWritable<Profile>,
) {
  const db = await requireAdminClient()
  const result = await updateProfile(db, id, patch)
  revalidatePath('/')
  revalidatePath('/admin/profile')
  return result
}

export async function upsertProfileAction(row: NullableWritable<Profile>) {
  const db = await requireAdminClient()
  const result = await upsertProfile(db, row)
  revalidatePath('/')
  revalidatePath('/admin/profile')
  return result
}
