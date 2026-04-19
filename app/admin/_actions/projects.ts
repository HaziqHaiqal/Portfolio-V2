'use server'

import { revalidatePath } from 'next/cache'
import { upsertProject, deleteProject } from '@lib/data'
import type { NullableWritable, Project } from '@lib/supabase'
import { requireAdminClient } from './auth'

export async function upsertProjectAction(
  row: NullableWritable<Project> & { id?: string },
) {
  const db = await requireAdminClient()
  const result = await upsertProject(db, row)
  revalidatePath('/')
  revalidatePath('/admin/projects')
  return result
}

export async function deleteProjectAction(id: string) {
  const db = await requireAdminClient()
  await deleteProject(db, id)
  revalidatePath('/')
  revalidatePath('/admin/projects')
}
