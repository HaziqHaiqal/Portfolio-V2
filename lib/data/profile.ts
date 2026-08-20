import type { NullableWritable, Profile } from '@lib/supabase';
import type { DB } from './types';

export async function getProfile(db: DB): Promise<Profile | null> {
  const { data, error } = await db.from('profile').select('*').single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Profile;
}

export async function updateProfile(
  db: DB,
  id: string,
  patch: NullableWritable<Profile>
): Promise<Profile> {
  const { data, error } = await db
    .from('profile')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function upsertProfile(
  db: DB,
  row: NullableWritable<Profile>
): Promise<Profile> {
  const { id, ...patch } = row;
  const payload = { ...patch, updated_at: new Date().toISOString() };

  const { data, error } = id
    ? await db.from('profile').update(payload).eq('id', id).select('*').single()
    : await db.from('profile').insert(payload).select('*').single();

  if (error) throw error;
  return data as Profile;
}
