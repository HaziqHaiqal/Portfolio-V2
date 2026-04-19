import type { Company, NullableWritable } from '@lib/supabase'
import type { DB } from './types'

export async function getCompanies(db: DB): Promise<Company[]> {
  const { data, error } = await db
    .from('companies')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return (data ?? []) as Company[]
}

export async function upsertCompany(
  db: DB,
  row: NullableWritable<Company> & { id?: string },
): Promise<Company> {
  const { data, error } = await db
    .from('companies')
    .upsert({ ...row, updated_at: new Date().toISOString() })
    .select('*')
    .single()
  if (error) throw error
  return data as Company
}

export async function deleteCompany(db: DB, id: string): Promise<void> {
  const { error } = await db.from('companies').delete().eq('id', id)
  if (error) throw error
}
