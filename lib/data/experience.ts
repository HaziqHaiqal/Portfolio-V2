import type { Experience, NullableWritable } from '@lib/supabase';
import type { DB } from './types';

export async function getExperience(db: DB): Promise<Experience[]> {
  const { data, error } = await db
    .from('experience')
    .select('*, companies(*)')
    .order('is_current', { ascending: false })
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Experience[];
}

export async function upsertExperience(
  db: DB,
  row: NullableWritable<Experience> & { id?: string }
): Promise<Experience> {
  const { id, ...patch } = row;
  const payload = { ...patch, updated_at: new Date().toISOString() };

  // A patch with `id` targets an existing row: a genuine UPDATE, so only
  // the given columns are validated. Routing this through `.upsert()`
  // instead makes Postgres construct a full candidate row for the insert
  // path it never takes, which trips NOT NULL on every omitted column.
  const { data, error } = id
    ? await db
        .from('experience')
        .update(payload)
        .eq('id', id)
        .select('*, companies(*)')
        .single()
    : await db
        .from('experience')
        .insert(payload)
        .select('*, companies(*)')
        .single();

  if (error) throw error;
  return data as Experience;
}

export async function deleteExperience(db: DB, id: string): Promise<void> {
  const { error } = await db.from('experience').delete().eq('id', id);
  if (error) throw error;
}
