'use server'

import { revalidatePath } from 'next/cache'
import { upsertSkill, deleteSkill } from '@lib/data'
import type { NullableWritable, Skill } from '@lib/supabase'
import { requireAdminClient } from './auth'

export async function upsertSkillAction(
  row: NullableWritable<Skill> & { id?: string },
) {
  const db = await requireAdminClient()
  const result = await upsertSkill(db, row)
  revalidatePath('/')
  revalidatePath('/admin/skills')
  return result
}

export async function deleteSkillAction(id: string) {
  const db = await requireAdminClient()
  await deleteSkill(db, id)
  revalidatePath('/')
  revalidatePath('/admin/skills')
}
