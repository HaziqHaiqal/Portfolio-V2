import type { Experience, NullableWritable } from '@lib/supabase'
import type { DB } from './types'

export async function getExperience(db: DB): Promise<Experience[]> {
  const { data, error } = await db
    .from('experience')
    .select('*, companies(*)')
    .order('is_current', { ascending: false })
    .order('start_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Experience[]
}

export async function upsertExperience(
  db: DB,
  row: NullableWritable<Experience> & { id?: string },
): Promise<Experience> {
  const { data, error } = await db
    .from('experience')
    .upsert({ ...row, updated_at: new Date().toISOString() })
    .select('*, companies(*)')
    .single()
  if (error) throw error
  return data as Experience
}

export async function deleteExperience(db: DB, id: string): Promise<void> {
  const { error } = await db.from('experience').delete().eq('id', id)
  if (error) throw error
}
