'use server'

import { revalidatePath } from 'next/cache'
import { upsertInterest, deleteInterest } from '@lib/data'
import type { Interest, NullableWritable } from '@lib/supabase'
import { requireAdminClient } from './auth'

export async function upsertInterestAction(
  row: NullableWritable<Interest> & { id?: string },
) {
  const db = await requireAdminClient()
  const result = await upsertInterest(db, row)
  revalidatePath('/')
  revalidatePath('/admin/interests')
  return result
}

export async function deleteInterestAction(id: string) {
  const db = await requireAdminClient()
  await deleteInterest(db, id)
  revalidatePath('/')
  revalidatePath('/admin/interests')
}
