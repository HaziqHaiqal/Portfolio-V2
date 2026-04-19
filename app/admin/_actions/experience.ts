'use server'

import { revalidatePath } from 'next/cache'
import { upsertExperience, deleteExperience } from '@lib/data'
import type { Experience, NullableWritable } from '@lib/supabase'
import { requireAdminClient } from './auth'

export async function upsertExperienceAction(
  row: NullableWritable<Experience> & { id?: string },
) {
  const db = await requireAdminClient()
  const result = await upsertExperience(db, row)
  revalidatePath('/')
  revalidatePath('/admin/experience')
  return result
}

export async function deleteExperienceAction(id: string) {
  const db = await requireAdminClient()
  await deleteExperience(db, id)
  revalidatePath('/')
  revalidatePath('/admin/experience')
}
