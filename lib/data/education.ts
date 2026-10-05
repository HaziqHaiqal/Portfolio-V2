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

  // update(), not upsert(): upsert() NOT NULL-checks every omitted column.
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
