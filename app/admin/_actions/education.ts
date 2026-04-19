'use server'

import { revalidatePath } from 'next/cache'
import { upsertEducation, deleteEducation } from '@lib/data'
import type { Education, NullableWritable } from '@lib/supabase'
import { requireAdminClient } from './auth'

export async function upsertEducationAction(
  row: NullableWritable<Education> & { id?: string },
) {
  const db = await requireAdminClient()
  const result = await upsertEducation(db, row)
  revalidatePath('/')
  revalidatePath('/admin/education')
  return result
}

export async function deleteEducationAction(id: string) {
  const db = await requireAdminClient()
  await deleteEducation(db, id)
  revalidatePath('/')
  revalidatePath('/admin/education')
}
