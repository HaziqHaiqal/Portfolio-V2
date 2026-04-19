'use server'

import { revalidatePath } from 'next/cache'
import { upsertCompany, deleteCompany } from '@lib/data'
import type { Company, NullableWritable } from '@lib/supabase'
import { requireAdminClient } from './auth'

export async function upsertCompanyAction(
  row: NullableWritable<Company> & { id?: string },
) {
  const db = await requireAdminClient()
  const result = await upsertCompany(db, row)
  revalidatePath('/')
  revalidatePath('/admin/companies')
  return result
}

export async function deleteCompanyAction(id: string) {
  const db = await requireAdminClient()
  await deleteCompany(db, id)
  revalidatePath('/')
  revalidatePath('/admin/companies')
}
