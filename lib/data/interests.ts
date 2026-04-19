import type { Interest, NullableWritable } from '@lib/supabase'
import type { DB } from './types'

export async function getInterests(db: DB): Promise<Interest[]> {
  const { data, error } = await db
    .from('interests')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Interest[]
}

export async function upsertInterest(
  db: DB,
  row: NullableWritable<Interest> & { id?: string },
): Promise<Interest> {
  const { data, error } = await db
    .from('interests')
    .upsert({ ...row, updated_at: new Date().toISOString() })
    .select('*')
    .single()
  if (error) throw error
  return data as Interest
}

export async function deleteInterest(db: DB, id: string): Promise<void> {
  const { error } = await db.from('interests').delete().eq('id', id)
  if (error) throw error
}
