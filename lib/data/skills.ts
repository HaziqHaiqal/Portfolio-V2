import type { Skill, NullableWritable } from '@lib/supabase';
import type { DB } from './types';

export async function getSkills(db: DB): Promise<Skill[]> {
  const { data, error } = await db
    .from('skills')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Skill[];
}

export async function upsertSkill(
  db: DB,
  row: NullableWritable<Skill> & { id?: string }
): Promise<Skill> {
  const { id, ...patch } = row;
  const payload = { ...patch, updated_at: new Date().toISOString() };

  // A patch with `id` targets an existing row: a genuine UPDATE, so only
  // the given columns are validated. Routing this through `.upsert()`
  // instead makes Postgres construct a full candidate row for the insert
  // path it never takes, which trips NOT NULL on every omitted column.
  const { data, error } = id
    ? await db.from('skills').update(payload).eq('id', id).select('*').single()
    : await db.from('skills').insert(payload).select('*').single();

  if (error) throw error;
  return data as Skill;
}

export async function deleteSkill(db: DB, id: string): Promise<void> {
  const { error } = await db.from('skills').delete().eq('id', id);
  if (error) throw error;
}
