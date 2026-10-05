import type { Company, NullableWritable } from '@lib/supabase';
import type { DB } from './types';

export async function getCompanies(db: DB): Promise<Company[]> {
  const { data, error } = await db
    .from('companies')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Company[];
}

export async function upsertCompany(
  db: DB,
  row: NullableWritable<Company> & { id?: string },
  mode: 'create' | 'update' = 'update'
): Promise<Company> {
  const { id, ...patch } = row;
  const payload = { ...patch, updated_at: new Date().toISOString() };

  // Create keeps the ID pending logo uploads use; otherwise update(), since upsert() NOT NULL-checks omitted columns.
  const { data, error } =
    id && mode !== 'create'
      ? await db
          .from('companies')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single()
      : await db
          .from('companies')
          .insert({ ...payload, ...(id ? { id } : {}) })
          .select('*')
          .single();

  if (error) throw error;
  return data as Company;
}

export async function deleteCompany(db: DB, id: string): Promise<void> {
  const { error } = await db.from('companies').delete().eq('id', id);
  if (error) throw error;
}
