import type { Skill, NullableWritable } from '@lib/supabase'
import type { DB } from './types'

export async function getSkills(db: DB): Promise<Skill[]> {
  const { data, error } = await db
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Skill[]
}

export async function upsertSkill(
  db: DB,
  row: NullableWritable<Skill> & { id?: string },
): Promise<Skill> {
  const { data, error } = await db
    .from('skills')
    .upsert({ ...row, updated_at: new Date().toISOString() })
    .select('*')
    .single()
  if (error) throw error
  return data as Skill
}

export async function deleteSkill(db: DB, id: string): Promise<void> {
  const { error } = await db.from('skills').delete().eq('id', id)
  if (error) throw error
}
