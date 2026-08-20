import type { Education, NullableWritable } from '@lib/supabase';
import type { DB } from './types';

export async function getEducation(db: DB): Promise<Education[]> {
  const { data, error } = await db
    .from('education')
    .select('*')
    .order('is_current', { ascending: false })
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Education[];
}

export async function upsertEducation(
  db: DB,
  row: NullableWritable<Education> & { id?: string }
): Promise<Education> {
  const { id, ...patch } = row;
  const payload = { ...patch, updated_at: new Date().toISOString() };

  // A patch with `id` targets an existing row: a genuine UPDATE, so only
  // the given columns are validated. Routing this through `.upsert()`
  // instead makes Postgres construct a full candidate row for the insert
  // path it never takes, which trips NOT NULL on every omitted column.
  const { data, error } = id
    ? await db
        .from('education')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()
    : await db.from('education').insert(payload).select('*').single();

  if (error) throw error;
  return data as Education;
}

export async function deleteEducation(db: DB, id: string): Promise<void> {
  const { error } = await db.from('education').delete().eq('id', id);
  if (error) throw error;
}
