import { unstable_cache } from 'next/cache';
import type { NullableWritable, WebsiteTemplate } from '@lib/supabase';
import type { DB } from './types';

export const TEMPLATES_TAG = 'website-templates';

export async function getActiveTemplates(db: DB): Promise<WebsiteTemplate[]> {
  const { data, error } = await db
    .from('website_templates')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
    compare_price:
      row.compare_price === null ? null : Number(row.compare_price),
  })) as WebsiteTemplate[];
}

// Builds its own client: cookies() is illegal inside a cache scope.
export const getCachedTemplates = unstable_cache(
  async (): Promise<WebsiteTemplate[]> => {
    const { createPublicSupabase } = await import('@lib/supabase/public');
    return getActiveTemplates(createPublicSupabase());
  },
  ['website-templates'],
  { tags: [TEMPLATES_TAG], revalidate: 3600 }
);

export async function upsertTemplate(
  db: DB,
  row: NullableWritable<WebsiteTemplate> & { id?: string },
  mode: 'create' | 'update' = 'update'
): Promise<WebsiteTemplate> {
  const { id, ...patch } = row;
  const payload = { ...patch, updated_at: new Date().toISOString() };

  // Create keeps the ID pending preview uploads use.
  const { data, error } =
    id && mode !== 'create'
      ? await db
          .from('website_templates')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single()
      : await db
          .from('website_templates')
          .insert({ ...payload, ...(id ? { id } : {}) })
          .select('*')
          .single();

  if (error) throw error;
  return data as WebsiteTemplate;
}

export async function deleteTemplate(db: DB, id: string): Promise<void> {
  const { error } = await db.from('website_templates').delete().eq('id', id);
  if (error) throw error;
}
