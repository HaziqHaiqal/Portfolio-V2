import type { Interest, NullableWritable } from '@lib/supabase';
import type { DB } from './types';

export async function getInterests(db: DB): Promise<Interest[]> {
  const { data, error } = await db
    .from('interests')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Interest[];
}

export async function upsertInterest(
  db: DB,
  row: NullableWritable<Interest> & { id?: string }
): Promise<Interest> {
  const { id, ...patch } = row;
  const payload = { ...patch, updated_at: new Date().toISOString() };

  // A patch with `id` targets an existing row: a genuine UPDATE, so only
  // the given columns are validated. Routing this through `.upsert()`
  // instead makes Postgres construct a full candidate row for the insert
  // path it never takes, which trips NOT NULL on every omitted column.
  const { data, error } = id
    ? await db
        .from('interests')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()
    : await db.from('interests').insert(payload).select('*').single();

  if (error) throw error;
  return data as Interest;
}

export async function deleteInterest(db: DB, id: string): Promise<void> {
  const { error } = await db.from('interests').delete().eq('id', id);
  if (error) throw error;
}
